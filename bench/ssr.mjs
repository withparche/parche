#!/usr/bin/env node
/**
 * Measures the server build: cold start (spawn to first 200), then latency
 * p50/p95/p99 for a page, a translated page, a post (a resolver), a product
 * (the collections resolver) and an address that does not exist, one at a
 * time and eight at a time; the miss also records its status and redirects.
 * Build first with `BENCH_OUTPUT=server node build.mjs`.
 *
 *   node ssr.mjs [--requests 200] [--label n1000]
 */
import { spawn, execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const requests = Number(opt('requests', 200));
const label = opt('label', '');
const entry = join(HERE, 'dist', 'server', 'entry.mjs');
if (!existsSync(entry)) throw new Error('No server build: run `BENCH_OUTPUT=server node build.mjs` first.');

// Addresses that exist in whatever size was generated.
const locales = readdirSync(join(HERE, 'src', 'content', 'pages'));
const other = locales.find((l) => l !== 'en');
const targets = {
  page: '/page-1',
  ...(other ? { translated: `/${other}/${other}-page-1` } : {}),
  post: '/post-1',
  product: '/store/demo-0',
  miss: '/does-not-exist',
};

const PORT = 4400 + Math.floor(Math.random() * 400);
const base = `http://127.0.0.1:${PORT}`;
const started = performance.now();
const server = spawn(process.execPath, [entry], { env: { ...process.env, HOST: '127.0.0.1', PORT: String(PORT) }, stdio: ['ignore', 'pipe', 'pipe'] });
let log = '';
server.stdout.on('data', (d) => (log += d));
server.stderr.on('data', (d) => (log += d));

async function once(path) {
  const t = performance.now();
  const res = await fetch(base + path, { redirect: 'manual' });
  await res.arrayBuffer();
  return { ms: performance.now() - t, status: res.status, location: res.headers.get('location') };
}

let cold;
for (;;) {
  try {
    const r = await once(targets.page);
    if (r.status === 200) {
      cold = { ms: Math.round(performance.now() - started), firstRequestMs: Math.round(r.ms) };
      break;
    }
  } catch {}
  if (performance.now() - started > 60_000) {
    server.kill();
    throw new Error(`Server did not answer 200 on ${targets.page} within 60 s.\n${log.slice(-2000)}`);
  }
  await new Promise((r) => setTimeout(r, 50));
}

const stats = (ms) => {
  const s = [...ms].sort((a, b) => a - b);
  const p = (q) => +s[Math.min(s.length - 1, Math.floor(q * s.length))].toFixed(2);
  return { p50: p(0.5), p95: p(0.95), p99: p(0.99), max: +s.at(-1).toFixed(2) };
};

const results = {};
for (const [name, path] of Object.entries(targets)) {
  const first = await once(path);
  const seq = [];
  for (let i = 0; i < requests; i++) seq.push((await once(path)).ms);
  const conc = [];
  let next = 0;
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (next < requests) {
      next++;
      conc.push((await once(path)).ms);
    }
  }));
  results[name] = { path, status: first.status, location: first.location, sequential: stats(seq), concurrent8: stats(conc) };
}

let rssMb = null;
try {
  rssMb = Math.round(Number(execSync(`ps -o rss= -p ${server.pid}`, { encoding: 'utf8' }).trim()) / 1024);
} catch {}
server.kill();

let sha = 'nogit';
try {
  sha = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim() + (execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' }).trim() ? '-dirty' : '');
} catch {}
const result = { kind: 'ssr', label, sha, date: new Date().toISOString(), requests, cold, rssMb, targets: results };
mkdirSync(join(HERE, 'results'), { recursive: true });
const file = join(HERE, 'results', `${result.date.slice(0, 19).replace(/[:T]/g, '-')}-${sha}${label ? '-' + label : ''}-ssr.json`);
writeFileSync(file, JSON.stringify(result, null, 2) + '\n');

console.log(`cold start ${cold.ms} ms (first request ${cold.firstRequestMs} ms), RSS ${rssMb} MB`);
console.table(Object.fromEntries(Object.entries(results).map(([k, v]) => [k, { status: v.status + (v.location ? ` → ${v.location}` : ''), 'p50/p95/p99 (1)': `${v.sequential.p50}/${v.sequential.p95}/${v.sequential.p99}`, 'p50/p95/p99 (8)': `${v.concurrent8.p50}/${v.concurrent8.p95}/${v.concurrent8.p99}` }])));
console.log(`→ ${file.replace(ROOT + '/', '')}`);
