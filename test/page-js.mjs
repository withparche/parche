// What a built page makes the browser download before it runs: the module
// scripts it references (`<script type="module" src>`, `<link rel=modulepreload>`),
// its inline module scripts, and every chunk those import statically, each
// counted once. A dynamic `import()` is not followed: it loads on demand (the
// polyfills, a lightbox's extras), so it is not the page's cost.
//
// Used by assert-dist.mjs for the per-page budgets; run on its own for a
// report: `node test/page-js.mjs demos/astrowind [--all]`.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

const SCRIPT_SRC = /<script\b[^>]*\btype="module"[^>]*\bsrc="([^"]+)"[^>]*>/g;
const PRELOAD = /<link\b[^>]*\brel="modulepreload"[^>]*\bhref="([^"]+)"[^>]*>/g;
const INLINE = /<script\b(?![^>]*\bsrc=)[^>]*\btype="module"[^>]*>([\s\S]*?)<\/script>/g;
// Static imports and re-exports in minified output: `import"./a.js"`,
// `import{x as y}from"./a.js"`, `export*from"/_astro/a.js"`. `import(` is
// dynamic and has no `from`/string right after `import`, so it never matches.
const STATIC_IMPORT = /(?:\bimport|\bexport)\s*(?:[\w$*{}\s,]+?\s*from\s*)?["']([^"']+\.m?js)["']/g;

export function walkHtml(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

/** Resolve a script URL from a page to a file under the site's root, or null (external). */
function toFile(root, from, url) {
  if (/^(?:[a-z]+:)?\/\//i.test(url)) return null;
  const path = url.split(/[?#]/)[0];
  const file = path.startsWith('/') ? join(root, path) : resolve(dirname(from), path);
  return file.startsWith(root + sep) && existsSync(file) ? file : null;
}

/**
 * The page's eager JS: `bytes` and gzipped `gzip` in total, and `files`, the
 * chunks it pulls in (paths relative to the root; inline scripts as `(inline)`).
 */
export function pageJs(root, htmlFile, cache = new Map()) {
  const html = readFileSync(htmlFile, 'utf8');
  const seen = new Set();
  const queue = [];
  for (const re of [SCRIPT_SRC, PRELOAD]) {
    for (const m of html.matchAll(re)) {
      const f = toFile(root, htmlFile, m[1]);
      if (f) queue.push(f);
    }
  }
  let inline = '';
  for (const m of html.matchAll(INLINE)) {
    inline += m[1];
    // An inline module can import a chunk too.
    for (const i of m[1].matchAll(STATIC_IMPORT)) {
      const f = toFile(root, htmlFile, i[1]);
      if (f) queue.push(f);
    }
  }
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    if (!cache.has(file)) {
      const src = readFileSync(file, 'utf8');
      const imports = [...src.matchAll(STATIC_IMPORT)].map((i) => toFile(root, file, i[1])).filter(Boolean);
      cache.set(file, { size: statSync(file).size, gzip: gzipSync(src).length, imports });
    }
    queue.push(...cache.get(file).imports);
  }
  let bytes = Buffer.byteLength(inline);
  let gzip = inline ? gzipSync(inline).length : 0;
  for (const f of seen) {
    bytes += cache.get(f).size;
    gzip += cache.get(f).gzip;
  }
  const files = [...seen].map((f) => relative(root, f)).sort();
  if (inline) files.push('(inline)');
  return { bytes, gzip, files };
}

/** Every page of a built site with its eager JS, heaviest first. */
export function sitePages(root) {
  const cache = new Map();
  return walkHtml(root)
    .map((file) => ({ page: '/' + relative(root, file).replace(/index\.html$/, '').split(sep).join('/'), ...pageJs(root, file, cache) }))
    .sort((a, b) => b.bytes - a.bytes);
}

// CLI: a report of one built site.
if (import.meta.url === `file://${process.argv[1]}`) {
  const proj = process.argv[2];
  if (!proj) {
    console.error('usage: node test/page-js.mjs <project> [--all]');
    process.exit(1);
  }
  const root = [join(proj, 'dist', 'client'), join(proj, 'dist')].find((d) => existsSync(d) && walkHtml(d).length);
  if (!root) {
    console.error(`${proj}: no built HTML`);
    process.exit(1);
  }
  const pages = sitePages(resolve(root));
  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  const median = pages[Math.floor(pages.length / 2)];
  console.log(`${proj}: ${pages.length} pages · median ${kb(median.bytes)} (${kb(median.gzip)} gz) · max ${kb(pages[0].bytes)} (${kb(pages[0].gzip)} gz) on ${pages[0].page}`);
  for (const p of process.argv.includes('--all') ? pages : pages.slice(0, 10)) {
    console.log(`  ${kb(p.bytes).padStart(9)}  ${kb(p.gzip).padStart(8)} gz  ${p.page}`);
  }
}
