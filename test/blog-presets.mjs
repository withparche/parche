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
// The two post paths render one page: a root-level permalink (core's route,
// through the blog's resolver) and a prefixed one (the blog's own route)
// must give the same head and structured data, bar the address.
const head = (file) => {
  const html = readFileSync(file, 'utf8');
  const tags = [...html.matchAll(/<(title|meta|link)\b[^>]*>(?:[^<]*<\/title>)?|<script type="application\/ld\+json"[^>]*>[^<]*<\/script>/g)].map((m) => m[0]);
  return tags.filter((t) => !/vite|stylesheet|modulepreload|icon/.test(t)).join('\n').replaceAll('/blog/elements-and-widgets', '/elements-and-widgets');
};
execFileSync('pnpm', ['exec', 'astro', 'build'], { cwd: SITE, env: { ...process.env, BLOG_PRESET: 'company' }, stdio: 'pipe' });
const rootLevel = head(join(DIST, 'elements-and-widgets', 'index.html'));
execFileSync('pnpm', ['exec', 'astro', 'build'], { cwd: SITE, env: { ...process.env, BLOG_PRESET: 'company', BLOG_POST_PERMALINK: '/blog/%slug%' }, stdio: 'pipe' });
const prefixedFile = join(DIST, 'blog', 'elements-and-widgets', 'index.html');
check(existsSync(prefixedFile), 'prefixed permalink: the post was not built at /blog/elements-and-widgets');
if (existsSync(prefixedFile)) {
  const prefixed = head(prefixedFile);
  check(prefixed === rootLevel, `prefixed permalink: the post's head differs from the root-level one\n--- root-level\n${rootLevel}\n--- prefixed\n${prefixed}`);
}
console.log('  both post paths: checked');

// Leave the example built as it ships.
execFileSync('pnpm', ['exec', 'astro', 'build'], { cwd: SITE, stdio: 'pipe' });

if (failures.length) {
  console.error(`\n✗ blog presets FAILED (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`✓ blog presets passed — ${Object.keys(PRESETS).length} presets built and checked`);
