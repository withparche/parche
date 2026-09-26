#!/usr/bin/env node
/**
 * The blog's presets, built for real: examples/blog is built once per preset
 * (BLOG_PRESET) and each build is checked for the pages its structure says
 * exist, and the ones it says do not. Turned-off features are not generated
 * at all, not hidden.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, 'examples/blog');
const DIST = join(SITE, 'dist');

// What each preset builds (examples/blog has one writer's two posts, in a series).
const PRESETS = {
  personal: { authorPages: false, series: true, readNext: true, article: 'BlogPosting', toc: false },
  company: { authorPages: true, series: false, readNext: true, article: 'BlogPosting', toc: true },
  magazine: { authorPages: true, series: true, readNext: true, article: 'NewsArticle', toc: true },
  newsletter: { authorPages: false, series: false, readNext: false, article: 'BlogPosting', toc: false },
};

const failures = [];
const check = (cond, msg) => { if (!cond) failures.push(msg); };

for (const [preset, want] of Object.entries(PRESETS)) {
  execFileSync('pnpm', ['exec', 'astro', 'build'], { cwd: SITE, env: { ...process.env, BLOG_PRESET: preset }, stdio: 'pipe' });
  check(existsSync(join(DIST, 'blog', 'author')) === want.authorPages, `${preset}: author pages ${want.authorPages ? 'missing' : 'built'}`);
  check(existsSync(join(DIST, 'blog', 'series')) === want.series, `${preset}: series pages ${want.series ? 'missing' : 'built'}`);
  const post = readFileSync(join(DIST, 'elements-and-widgets', 'index.html'), 'utf8');
  check(post.includes(`"@type":"${want.article}"`), `${preset}: the article is not a ${want.article}`);
  check(post.includes('parche-read-next') === want.readNext, `${preset}: "Read next" ${want.readNext ? 'missing' : 'shown'}`);
  check(post.includes('<parche-toc') === want.toc, `${preset}: table of contents ${want.toc ? 'missing' : 'shown'}`);
  for (const page of ['blog/index.html', 'blog/archive/index.html', 'search/index.html', 'subscribe/index.html']) check(existsSync(join(DIST, page)), `${preset}: ${page} missing`);
  console.log(`  ${preset}: ok`);
}
// Leave the example built as it ships.
execFileSync('pnpm', ['exec', 'astro', 'build'], { cwd: SITE, stdio: 'pipe' });

if (failures.length) {
  console.error(`\n✗ blog presets FAILED (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`✓ blog presets passed — ${Object.keys(PRESETS).length} presets built and checked`);
