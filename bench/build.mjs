#!/usr/bin/env node
/**
 * Builds a site and measures it: wall time, peak memory, how long the static
 * pages took (Astro's own `(+Nms)` per page, as p50/p95/max/sum) and time per
 * page, so a cost that grows faster than the site shows as time per page
 * rising with size. Writes results/<date>-<sha>-build.json and prints a table.
 *
 *   node build.mjs                           # this folder's generated site
 *   node build.mjs --project demos/astrowind # any project, from the repo root
 *   node build.mjs --label n1000 --cpu-prof  # tag the result; V8 CPU profile
 *   BENCH_OUTPUT=server node build.mjs       # the server build (for ssr.mjs)
 *   PARCHE_PROFILE=1 node build.mjs          # also where the time went, by phase
 */
import { spawnSync, execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const project = opt('project') ? resolve(ROOT, opt('project')) : HERE;
const label = opt('label', '');
const cpuProf = argv.includes('--cpu-prof');

const astro = join(project, 'node_modules', '.bin', 'astro');
if (!existsSync(astro)) throw new Error(`No astro in ${project}/node_modules: run pnpm install.`);

// /usr/bin/time reports peak memory: -l on macOS (bytes), -v on Linux (KB).
const mac = process.platform === 'darwin';
const timeArgs = mac ? ['-l'] : ['-v'];
const env = { ...process.env, ...(cpuProf ? { NODE_OPTIONS: `--cpu-prof --cpu-prof-dir=${join(HERE, 'results', 'profiles')}` } : {}) };

const started = performance.now();
const run = spawnSync('/usr/bin/time', [...timeArgs, astro, 'build'], { cwd: project, env, encoding: 'utf8', maxBuffer: 1024 * 1024 * 512 });
const wallMs = performance.now() - started;
const out = `${run.stdout}\n${run.stderr}`;
if (run.status !== 0) {
  console.error(out.split('\n').slice(-40).join('\n'));
  process.exit(run.status ?? 1);
}

const rss = mac
  ? Number(/(\d+)\s+maximum resident set size/.exec(out)?.[1] ?? 0) / 1024 / 1024
  : Number(/Maximum resident set size \(kbytes\): (\d+)/.exec(out)?.[1] ?? 0) / 1024;

// Every prerendered page: "├─ /path/index.html (+12ms)".
const pageMs = [...out.matchAll(/[├└]─ \S+ \(\+(\d+)ms\)/g)].map((m) => Number(m[1])).sort((a, b) => a - b);
const pct = (p) => (pageMs.length ? pageMs[Math.min(pageMs.length - 1, Math.floor((p / 100) * pageMs.length))] : 0);
const sum = pageMs.reduce((a, b) => a + b, 0);
const staticPhase = Number(/generating static routes[\s\S]*?Completed in ([\d.]+)(m?s)/.exec(out)?.[1] ?? 0);

let sha = 'nogit';
try {
  sha = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim() + (execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' }).trim() ? '-dirty' : '');
} catch {}

// With PARCHE_PROFILE=1 the integration prints where the time went (utils/profile.ts).
const profile = Object.fromEntries(
  [...(/profile \(ms, calls\):\n((?:\s{2}\S+\s+\d+\s+\d+\n?)+)/.exec(out)?.[1] ?? '').matchAll(/\s{2}(\S+)\s+(\d+)\s+(\d+)/g)].map((m) => [m[1], { ms: Number(m[2]), calls: Number(m[3]) }]),
);

const result = {
  kind: 'build',
  project: project.replace(ROOT + '/', ''),
  label,
  output: process.env.BENCH_OUTPUT === 'server' ? 'server' : 'static',
  sha,
  date: new Date().toISOString(),
  wallMs: Math.round(wallMs),
  peakRssMb: Math.round(rss),
  pages: pageMs.length,
  pageMs: { p50: pct(50), p95: pct(95), max: pageMs.at(-1) ?? 0, sum },
  msPerPage: pageMs.length ? +(wallMs / pageMs.length).toFixed(2) : null,
  staticPhase,
  ...(Object.keys(profile).length ? { profile } : {}),
};

mkdirSync(join(HERE, 'results'), { recursive: true });
const file = join(HERE, 'results', `${result.date.slice(0, 19).replace(/[:T]/g, '-')}-${sha}${label ? '-' + label : ''}-build.json`);
writeFileSync(file, JSON.stringify(result, null, 2) + '\n');
console.table({ wall: `${(wallMs / 1000).toFixed(1)} s`, 'peak RSS': `${result.peakRssMb} MB`, pages: result.pages, 'page p50/p95/max': `${result.pageMs.p50}/${result.pageMs.p95}/${result.pageMs.max} ms`, 'pages sum': `${(sum / 1000).toFixed(1)} s`, 'ms per page (wall)': result.msPerPage });
if (result.profile) console.table(result.profile);
console.log(`→ ${file.replace(ROOT + '/', '')}`);
