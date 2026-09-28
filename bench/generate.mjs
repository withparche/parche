#!/usr/bin/env node
/**
 * Writes the benchmark site's content at a given size, from demos/astrowind:
 * its layouts, menus, patterns, authors, taxonomies, views, assets and site
 * config are copied as they are, and its pages' sections are the pool the
 * generated pages draw from, so every node is one the demo already renders.
 *
 *   node generate.mjs --pages 1000 --posts 1000 --entries 0 --locales en,es,fr --seed 1
 *
 * Every page exists in every locale (a translation with its own address), so
 * the cost of translations shows. About 30% of pages list the products with a
 * `$collection` and the latest posts; about 20% use a pattern. Posts are
 * Markdown of about 800 words with sections, in every locale; entries are
 * products with a page each. The same seed writes the same site.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEMO = join(HERE, '..', 'demos', 'astrowind', 'src');
const SRC = join(HERE, 'src');
const CONTENT = join(SRC, 'content');

function args() {
  // `sections` is how many a page gets, as a range: `--sections 15-20`.
  const out = { pages: 100, posts: 100, entries: 0, locales: ['en'], seed: 1, sections: [3, 6] };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 2) {
    const [k, v] = [argv[i].replace(/^--/, ''), argv[i + 1]];
    if (!(k in out) || v === undefined) throw new Error(`Unknown or empty option --${k}. Options: --pages --posts --entries --locales --seed --sections`);
    out[k] = k === 'locales' ? v.split(',').map((s) => s.trim()).filter(Boolean) : k === 'sections' ? v.split('-').map(Number) : Number(v);
  }
  if (out.sections.length !== 2 || out.sections.some((n) => !Number.isInteger(n) || n < 1) || out.sections[0] > out.sections[1]) throw new Error('--sections takes a range like 3-6');
  return out;
}

/** mulberry32: a small seeded PRNG, so a seed always writes the same site. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function files(dir, ext) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...files(full, ext));
    else if (name.endsWith(ext)) out.push(full);
  }
  return out;
}

const write = (file, text) => {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
};
const json = (value) => JSON.stringify(value, null, 2) + '\n';

const opts = args();
const random = rng(opts.seed);
const pick = (list) => list[Math.floor(random() * list.length)];
const [defaultLocale] = opts.locales;

// A clean slate: nothing from a previous size is left behind.
rmSync(CONTENT, { recursive: true, force: true });
rmSync(join(SRC, 'assets'), { recursive: true, force: true });

// The demo's shared content, as it is. The demo is English only, and a
// reference is looked up in the page's locale and then as written (no
// fallback to the default locale), so every other locale gets a copy of the
// English layouts, menus, patterns and views, as a translated site would.
cpSync(join(DEMO, 'assets'), join(SRC, 'assets'), { recursive: true });
for (const dir of ['layouts', 'navigation', 'patterns', 'authors', 'taxonomies', 'views']) {
  cpSync(join(DEMO, 'content', dir), join(CONTENT, dir), { recursive: true });
  const en = join(CONTENT, dir, 'en');
  if (!existsSync(en) || !statSync(en).isDirectory()) continue;
  for (const locale of opts.locales) if (locale !== 'en') cpSync(en, join(CONTENT, dir, locale), { recursive: true });
}

// The site config: the demo's, with the locales measured and products served
// at /store/<id>.
const siteConfig = JSON.parse(readFileSync(join(DEMO, 'parche.config.json'), 'utf8'));
siteConfig.i18n = { ...(siteConfig.i18n ?? {}), defaultLocale, locales: opts.locales };
siteConfig.collections = { products: { path: '/store/%slug%', widget: 'pattern/product-page' } };
write(join(SRC, 'parche.config.json'), json(siteConfig));

// The pool: every section of the demo's pages, except its not-found page.
const demoPages = files(join(DEMO, 'content', 'pages', 'en'), '.json').filter((f) => !f.endsWith('404.json'));
const pool = demoPages.flatMap((f) => JSON.parse(readFileSync(f, 'utf8')).sections ?? []);
const productList = pool.find((s) => JSON.stringify(s).includes('"$collection":"products"')) ?? null;

const words = 'layout widget section token theme render build page site content grid column schema pattern locale menu header footer image asset route slug index cache query entry value field model tree node slot outlet wrapper prop default variant palette spacing rhythm reading measure'.split(' ');
const sentence = (n) => {
  const w = Array.from({ length: n }, () => pick(words));
  w[0] = w[0][0].toUpperCase() + w[0].slice(1);
  return w.join(' ') + '.';
};
const paragraph = () => Array.from({ length: 5 + Math.floor(random() * 4) }, () => sentence(8 + Math.floor(random() * 10))).join(' ');

// Pages: the demo's home and not-found page in every locale, then the generated ones.
for (const locale of opts.locales) {
  for (const name of ['home.json', '404.json']) {
    const from = join(DEMO, 'content', 'pages', 'en', name);
    if (existsSync(from)) write(join(CONTENT, 'pages', locale, name), readFileSync(from, 'utf8'));
  }
}
for (let i = 0; i < opts.pages; i++) {
  const [least, most] = opts.sections;
  const count = least + Math.floor(random() * (most - least + 1));
  const sections = Array.from({ length: count }, () => structuredClone(pick(pool)));
  const roll = random();
  if (roll < 0.3) {
    // A page lists a few products, as a real page does. The demo's list has
    // no limit (its store has 24 products); copied as is, every such page
    // would render the whole catalog, 1,000 cards with an image at the top
    // size, which measures the catalog, not the page.
    if (productList) {
      const list = structuredClone(productList);
      const items = list.props?.items;
      if (items && typeof items === 'object' && items.limit === undefined) items.limit = 8;
      sections.push(list);
    }
    sections.push({ widget: 'BlogLatestPosts', props: { count: 3 } });
  } else if (roll < 0.5) {
    sections.splice(1, 0, { widget: 'pattern/tour-step', props: { url: `page ${i} · 1200×760`, title: sentence(5), subtitle: sentence(12) } });
  }
  for (const locale of opts.locales) {
    const page = {
      title: `Page ${i} ${sentence(3)}`,
      description: sentence(14),
      ...(locale === defaultLocale ? {} : { urlSlug: `${locale}-page-${i}` }),
      sections,
    };
    write(join(CONTENT, 'pages', locale, `page-${i}.json`), json(page));
  }
}

// Posts, in every locale, spread over three years.
const categories = Array.from({ length: 20 }, (_, i) => `Category ${i + 1}`);
const tags = Array.from({ length: 60 }, (_, i) => `tag-${i + 1}`);
const images = files(join(SRC, 'assets', 'images'), '.png').map((f) => '@/assets/' + relative(join(SRC, 'assets'), f).split('\\').join('/'));
for (let i = 0; i < opts.posts; i++) {
  const day = new Date(Date.UTC(2023, 0, 1) + Math.floor(random() * 1095) * 86_400_000).toISOString();
  const postTags = Array.from(new Set(Array.from({ length: 2 + Math.floor(random() * 3) }, () => pick(tags))));
  const image = random() < 0.2 && images.length ? `image:\n  src: "${pick(images)}"\n  alt: ""\n` : '';
  const body = Array.from({ length: 4 }, (_, s) => `## ${sentence(4).slice(0, -1)}\n\n${paragraph()}\n\n${paragraph()}\n`).join('\n');
  for (const locale of opts.locales) {
    const front = [
      '---',
      `title: "Post ${i} ${sentence(4).slice(0, -1)}"`,
      // A translation keeps the file name (that is what pairs it with the
      // original) and takes its own address, as a translated post does.
      ...(locale === defaultLocale ? [] : [`urlSlug: "${locale}-post-${i}"`]),
      `excerpt: "${sentence(16)}"`,
      `publishDate: "${day}"`,
      `category: "${pick(categories)}"`,
      'tags:',
      ...postTags.map((t) => `  - ${t}`),
      'authors:',
      `  - ${pick(['jane', 'mark'])}`,
      image.trimEnd(),
      '---',
    ].filter(Boolean);
    write(join(CONTENT, 'posts', locale, `post-${i}.md`), front.join('\n') + '\n\n' + body);
  }
}

// Products: the demo's three, then as many more as asked, each with a page.
const demoProducts = files(join(DEMO, 'content', 'products'), '.json').map((f) => JSON.parse(readFileSync(f, 'utf8')));
for (const [n, p] of demoProducts.entries()) write(join(CONTENT, 'products', `demo-${n}.json`), json(p));
for (let i = 0; i < opts.entries; i++) {
  const base = demoProducts[i % demoProducts.length];
  write(join(CONTENT, 'products', `product-${i}.json`), json({ ...base, name: `${base.name} ${i}`, order: i + demoProducts.length }));
}

console.log(`bench: ${opts.pages} pages × ${opts.locales.length} locale(s), ${opts.posts} posts × ${opts.locales.length}, ${opts.entries + demoProducts.length} products (seed ${opts.seed})`);
