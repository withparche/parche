// What a built page makes the browser download to style itself: its
// `<link rel="stylesheet">` files (each counted once per page) and its inline
// `<style>` blocks, raw and gzipped. The CSS counterpart of page-js.mjs, used
// by assert-dist.mjs for the per-page budgets; run on its own for a report:
// `node test/page-css.mjs demos/astrowind [--all]`.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { gzipSync } from 'node:zlib';
import { walkHtml } from './page-js.mjs';

const LINK = /<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"[^>]*>/g;
const STYLE = /<style\b[^>]*>([\s\S]*?)<\/style>/g;

function toFile(root, from, url) {
  if (/^(?:[a-z]+:)?\/\//i.test(url)) return null;
  const path = url.split(/[?#]/)[0];
  const file = path.startsWith('/') ? join(root, path) : resolve(dirname(from), path);
  return file.startsWith(root + sep) && existsSync(file) ? file : null;
}

/** The page's CSS: `bytes` and gzipped `gzip` in total, and `files` (relative to the root; inline as `(inline)`). */
export function pageCss(root, htmlFile, cache = new Map()) {
  const html = readFileSync(htmlFile, 'utf8');
  const files = new Set();
  for (const m of html.matchAll(LINK)) {
    const f = toFile(root, htmlFile, m[1]);
    if (f) files.add(f);
  }
  let inline = '';
  for (const m of html.matchAll(STYLE)) inline += m[1];
  let bytes = Buffer.byteLength(inline);
  let gzip = inline ? gzipSync(inline).length : 0;
  for (const f of files) {
    if (!cache.has(f)) cache.set(f, { size: statSync(f).size, gzip: gzipSync(readFileSync(f)).length });
    bytes += cache.get(f).size;
    gzip += cache.get(f).gzip;
  }
  const list = [...files].map((f) => relative(root, f)).sort();
  if (inline) list.push('(inline)');
  return { bytes, gzip, files: list };
}

/** Every page of a built site with its CSS, heaviest first. */
export function siteCss(root) {
  const cache = new Map();
  return walkHtml(root)
    .map((file) => ({ page: '/' + relative(root, file).replace(/index\.html$/, '').split(sep).join('/'), ...pageCss(root, file, cache) }))
    .sort((a, b) => b.bytes - a.bytes);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const proj = process.argv[2];
  if (!proj) {
    console.error('usage: node test/page-css.mjs <project> [--all]');
    process.exit(1);
  }
  const root = [join(proj, 'dist', 'client'), join(proj, 'dist')].find((d) => existsSync(d) && walkHtml(d).length);
  if (!root) {
    console.error(`${proj}: no built HTML`);
    process.exit(1);
  }
  const pages = siteCss(resolve(root));
  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  const median = pages[Math.floor(pages.length / 2)];
  console.log(`${proj}: ${pages.length} pages · median ${kb(median.bytes)} (${kb(median.gzip)} gz) · max ${kb(pages[0].bytes)} (${kb(pages[0].gzip)} gz) on ${pages[0].page}`);
  for (const p of process.argv.includes('--all') ? pages : pages.slice(0, 10)) {
    console.log(`  ${kb(p.bytes).padStart(9)}  ${kb(p.gzip).padStart(8)} gz  ${p.page}`);
  }
}
