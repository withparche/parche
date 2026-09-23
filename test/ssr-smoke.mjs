// SSR smoke: start each server-rendered example from its build output, fetch
// the `/elements` page, and assert every element rendered. This is what proves
// that no element touches `window` or `document` at request time — on Node
// (`node dist/server/entry.mjs`) and on Cloudflare's workerd (`wrangler dev`).
// Run from the repo root after `pnpm -r build`: `node test/ssr-smoke.mjs`.
import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

/** Every element folder under the package (`_`-prefixed folders are shared code). */
const ELEMENTS = readdirSync(join(ROOT, 'parches/elements/src'), { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith('_'))
  .map((e) => e.name)
  .sort();

const SERVERS = [
  {
    name: 'examples/ssr-node',
    port: 4392,
    command: 'node',
    args: ['examples/ssr-node/dist/server/entry.mjs'],
    env: { HOST: '127.0.0.1', PORT: '4392' },
  },
  {
    name: 'examples/ssr-cloudflare',
    port: 4393,
    command: 'pnpm',
    args: ['--filter', 'example-ssr-cloudflare', 'exec', 'wrangler', 'dev', '--port', '4393', '--ip', '127.0.0.1'],
    env: {},
  },
];

const failures = [];

// Poll until the page is really served: `wrangler dev` answers 200 with a
// placeholder while workerd is still starting, so a status alone is not enough.
async function waitFor(url, ms, ready) {
  const deadline = Date.now() + ms;
  let last = '';
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      const html = await res.text();
      if (res.ok && ready(html)) return html;
      last = `${res.status} ${html.slice(0, 200)}`;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${url} not ready within ${ms}ms; last response: ${last}`);
}

for (const server of SERVERS) {
  const child = spawn(server.command, server.args, {
    cwd: ROOT,
    env: { ...process.env, ...server.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  child.stdout.on('data', (d) => (log += d));
  child.stderr.on('data', (d) => (log += d));

  try {
    const url = `http://127.0.0.1:${server.port}/elements`;
    // A render error mid-stream still answers 200 with a truncated body, so
    // the page counts as served only once it is complete.
    const html = await waitFor(url, 60_000, (body) => body.includes('data-element="') && body.trimEnd().endsWith('</html>'));
    const missing = ELEMENTS.filter((name) => !html.includes(`data-element="${name}"`));
    if (missing.length) failures.push(`${server.name}: /elements is missing ${missing.join(', ')}`);
    const roots = (html.match(/data-part="root"/g) ?? []).length;
    if (roots < ELEMENTS.length) failures.push(`${server.name}: ${roots} data-part="root" (< ${ELEMENTS.length} elements)`);
    if (/data-parche-missing-widget/.test(html)) failures.push(`${server.name}: unresolved widget on /elements`);
    console.log(`${server.name}: /elements OK — ${ELEMENTS.length} elements, ${roots} roots, ${html.length} bytes`);
  } catch (e) {
    failures.push(`${server.name}: ${e.message}\n${log.split('\n').slice(-20).join('\n')}`);
  } finally {
    child.kill('SIGTERM');
    await new Promise((r) => setTimeout(r, 500));
    if (server.command === 'pnpm') spawn('pkill', ['-f', `wrangler dev --port ${server.port}`]);
  }
}

if (failures.length) {
  console.error('\nSSR smoke failed:\n' + failures.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(`\nSSR smoke OK: ${ELEMENTS.length} elements on ${SERVERS.length} adapters.`);
