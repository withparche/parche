#!/usr/bin/env node
/**
 * What a server build loads: the total size of dist/server, its largest
 * chunks, and the static import closure of core's catch-all page (the chunk
 * that calls getResolverPaths), which is what every data page's request
 * loads on a cold start. Flags whether that closure evaluates the widgets'
 * JSON Schemas (`toJSONSchema`), which a request never needs.
 *
 *   node chunks.mjs [--project examples/ssr-node] [--json]
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const argv = process.argv.slice(2);
const i = argv.indexOf('--project');
const project = i === -1 ? HERE : resolve(ROOT, argv[i + 1]);
const serverDir = join(project, 'dist', 'server');
if (!existsSync(serverDir)) throw new Error(`${serverDir}: no server build`);

// Static imports in the (unminified) server output; `import(` is dynamic and not followed.
const STATIC = /(?:^|\n)\s*(?:import|export)\s[^;'"]*?from\s*["'](\.[^"']+\.mjs)["']|(?:^|\n)\s*import\s*["'](\.[^"']+\.mjs)["']/g;

function walk(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) walk(f, acc);
    else if (f.endsWith('.mjs')) acc.push(f);
  }
  return acc;
}

const files = walk(serverDir);
const size = (f) => statSync(f).size;
const total = files.reduce((a, f) => a + size(f), 0);
const catchAll = files.find((f) => readFileSync(f, 'utf8').includes('getResolverPaths('));

function closure(entry) {
  const seen = new Set();
  const queue = [entry];
  while (queue.length) {
    const f = queue.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(STATIC)) queue.push(resolve(dirname(f), m[1] ?? m[2]));
  }
  return [...seen].filter(existsSync);
}

const kb = (n) => +(n / 1024).toFixed(1);
const report = { project: project.replace(ROOT + '/', ''), totalKb: kb(total), chunks: files.length, largest: files.sort((a, b) => size(b) - size(a)).slice(0, 10).map((f) => ({ file: f.replace(serverDir + '/', ''), kb: kb(size(f)) })) };
if (catchAll) {
  const c = closure(catchAll);
  report.catchAll = {
    chunk: catchAll.replace(serverDir + '/', ''),
    closureKb: kb(c.reduce((a, f) => a + size(f), 0)),
    closureFiles: c.length,
    evaluatesJsonSchema: c.some((f) => readFileSync(f, 'utf8').includes('toJSONSchema')),
  };
}

if (argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`${report.project}: ${report.totalKb} KB in ${report.chunks} server chunks`);
  if (report.catchAll) console.log(`catch-all ${report.catchAll.chunk}: static closure ${report.catchAll.closureKb} KB in ${report.catchAll.closureFiles} files; evaluates widget JSON Schemas: ${report.catchAll.evaluatesJsonSchema ? 'YES' : 'no'}`);
  console.table(report.largest);
}
