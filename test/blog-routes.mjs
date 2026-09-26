#!/usr/bin/env node
/**
 * Blog routes, checked on the built sites (run after `pnpm -r build`).
 *
 * The blog's pages are generated from content and permalink patterns, so a
 * wrong slug shows up only as a link to a page that was never built. This
 * walks the built HTML of every site with a blog and checks:
 *
 * - every internal link on every page leads to a page that exists;
 * - the listing, its pagination, the taxonomy and author pages and the feed
 *   are generated, for the posts the site has;
 * - every page advertises the feed in its head;
 * - a post shows its lead, "Read next" and, when its preset has one, a
 *   table of contents, and carries BlogPosting structured data.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Sites with a blog, and what their content should produce. */
const SITES = {
  // company preset: several writers, each with a page.
  'demos/astrowind': { posts: 6, perPage: 6, listing: '/blog', rss: '/rss.xml', authorPages: true, toc: true },
  // personal preset: one writer, no author pages; the byline links to /about.
  'examples/blog': { posts: 2, perPage: 6, listing: '/blog', rss: '/rss.xml', authorPages: false, toc: false },
};

const failures = [];
const check = (cond, msg) => { if (!cond) failures.push(msg); };

function walkHtml(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

/** Does a site-relative path resolve to a built page? */
function built(dist, path) {
  const clean = decodeURI(path).replace(/\/+$/, '');
  if (clean === '') return existsSync(join(dist, 'index.html'));
  return existsSync(join(dist, clean, 'index.html')) || existsSync(join(dist, `${clean}.html`));
}

for (const [site, want] of Object.entries(SITES)) {
  const dist = join(ROOT, site, 'dist');
  if (!existsSync(dist)) {
    failures.push(`${site}: no dist/ — did the build run?`);
    continue;
  }
  const pages = walkHtml(dist);

  // Every internal link resolves. Assets (/_astro, files with an extension
  // other than .html) are left to the bundler's own checks.
  const broken = new Map();
  for (const file of pages) {
    const html = readFileSync(file, 'utf8');
    for (const [, href] of html.matchAll(/<a\b[^>]*\shref="(\/[^"]*)"/g)) {
      if (href.startsWith('//') || /^\/_astro\//.test(href)) continue;
      const bare = href.split('#')[0].split('?')[0];
      if (/\.[a-z0-9]+$/i.test(bare) && !bare.endsWith('.html')) {
        check(existsSync(join(dist, bare)), `${site}: ${file.slice(dist.length)} links to missing file ${bare}`);
        continue;
      }
      if (!built(dist, bare)) broken.set(bare, file.slice(dist.length));
    }
  }
  for (const [href, from] of broken) failures.push(`${site}: ${from} links to ${href}, which was not built`);

  // The listing is a CollectionPage with its posts as an ItemList, and the
  // site advertises its search.
  const listingHtml = readFileSync(join(dist, want.listing, 'index.html'), 'utf8');
  check(/"@type":"CollectionPage"/.test(listingHtml) && /"@type":"ItemList"/.test(listingHtml), `${site}: the listing is not a CollectionPage with an ItemList`);
  check(/"@type":"SearchAction"/.test(listingHtml), `${site}: the WebSite does not advertise the search`);

  // The listing and its pages.
  const lastPage = Math.max(1, Math.ceil(want.posts / want.perPage));
  check(existsSync(join(dist, want.listing, 'index.html')), `${site}: no listing at ${want.listing}`);
  for (let n = 2; n <= lastPage; n++) check(existsSync(join(dist, want.listing, String(n), 'index.html')), `${site}: listing page ${n} missing`);
  check(!existsSync(join(dist, want.listing, String(lastPage + 1), 'index.html')), `${site}: listing page ${lastPage + 1} built past the last post`);

  // The archive, newest year at its own address.
  check(existsSync(join(dist, want.listing, 'archive', 'index.html')), `${site}: no archive at ${want.listing}/archive`);

  // Search: a noindex page, and the index the blog builds after the site.
  const search = join(dist, 'search', 'index.html');
  check(existsSync(search) && /<meta name="robots" content="noindex/.test(readFileSync(search, 'utf8')), `${site}: no noindex search page at /search`);
  check(existsSync(join(dist, 'pagefind', 'pagefind.js')), `${site}: no search index (dist/pagefind)`);

  // Author pages exist only for a blog with several writers.
  const authorDir = join(dist, want.listing, 'author');
  check(existsSync(authorDir) === want.authorPages, `${site}: author pages ${want.authorPages ? 'missing' : 'built for a single-writer blog'}`);

  // The feed exists, has one item per post, and every page points to it.
  const feed = join(dist, want.rss);
  check(existsSync(feed), `${site}: no feed at ${want.rss}`);
  if (existsSync(feed)) {
    const items = (readFileSync(feed, 'utf8').match(/<item>/g) ?? []).length;
    check(items === want.posts, `${site}: feed has ${items} items, expected ${want.posts}`);
  }
  const feedLink = new RegExp(`<link[^>]*rel="alternate"[^>]*type="application/rss\\+xml"[^>]*href="${want.rss}"|<link[^>]*href="${want.rss}"[^>]*type="application/rss\\+xml"`);
  const noFeed = pages.filter((f) => !feedLink.test(readFileSync(f, 'utf8')));
  check(noFeed.length === 0, `${site}: ${noFeed.length} page(s) without the feed link in their head (e.g. ${noFeed[0]?.slice(dist.length)})`);

  // Posts: a page with BlogPosting data. Each shows a lead paragraph and, when
  // it has related posts, a link back to the listing.
  const posts = pages.filter((f) => readFileSync(f, 'utf8').includes('"@type":"BlogPosting"'));
  check(posts.length === want.posts, `${site}: ${posts.length} post page(s) with BlogPosting data, expected ${want.posts}`);
  for (const file of posts) {
    const html = readFileSync(file, 'utf8');
    const lead = html.match(/<h1[^>]*>[\s\S]*?<\/h1>\s*(?:<[^>]+>\s*)*<p[^>]*>([^<]{20,})/);
    check(!!lead, `${site}: ${file.slice(dist.length)} shows no lead paragraph under its title`);
    // Described once: one article node, one trail.
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? '{"@graph":[]}')['@graph'];
    const kinds = graph.map((n) => n['@type']);
    check(kinds.filter((t) => ['Article', 'BlogPosting', 'NewsArticle'].includes(t)).length === 1 && kinds.filter((t) => t === 'BreadcrumbList').length === 1, `${site}: ${file.slice(dist.length)} describes its article or trail more than once (${kinds.join(', ')})`);
    check(html.includes('parche-read-next'), `${site}: ${file.slice(dist.length)} has no "Read next"`);
    // The company preset's article carries a table of contents; the personal one does not.
    check(html.includes('<parche-toc') === want.toc, `${site}: ${file.slice(dist.length)} ${want.toc ? 'has no' : 'has a'} table of contents`);
  }
}

if (failures.length) {
  console.error(`\n✗ blog routes FAILED (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`✓ blog routes passed — ${Object.keys(SITES).length} sites, every internal link resolves`);
