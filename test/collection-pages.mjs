#!/usr/bin/env node
/**
 * Pages from a collection (@parche/astro-collections), built for real: the
 * demo's products collection holds only data, and each product gets a page
 * at /homes/store/<id> rendered by the product-page pattern. Checks that every
 * product has its page with its own title, heading, price and stock, that the
 * page offers the basket or the restock alert as the product says, and that
 * the store's list (a { "$collection": "products" }) links to each page.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEMO = join(ROOT, 'demos/astrowind');
const DIST = join(DEMO, 'dist');
const failures = [];
const check = (cond, msg) => { if (!cond) failures.push(msg); };

const products = readdirSync(join(DEMO, 'src/content/products')).filter((f) => f.endsWith('.json'));
check(products.length === 3, `expected the demo's three products, found ${products.length}`);
const store = readFileSync(join(DIST, 'homes/store/index.html'), 'utf8');
for (const file of products) {
  const id = file.replace(/\.json$/, '');
  const data = JSON.parse(readFileSync(join(DEMO, 'src/content/products', file), 'utf8'));
  const page = join(DIST, 'homes/store', id, 'index.html');
  check(existsSync(page), `${id}: no page at /homes/store/${id}`);
  if (!existsSync(page)) continue;
  const html = readFileSync(page, 'utf8');
  check(html.includes(`<title>${data.name} — `), `${id}: the title is not the product's name`);
  check(new RegExp(`<h1[^>]*>${data.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<`).test(html), `${id}: the heading is not the product's name`);
  check(html.includes(`>${data.price}<`) && html.includes(`>${data.stock.label}<`), `${id}: price or stock missing`);
  if (data.cart) check(html.includes(`>${data.cart.text}<`), `${id}: in stock, but no "${data.cart.text}"`);
  if (data.restock) check(html.includes(`>${data.restock.text}<`) && !html.includes('>Add to basket<'), `${id}: sold out, but no restock alert (or a basket button)`);
  check(/<meta property="og:site_name" content="[^"]+"/.test(html), `${id}: og:site_name missing`);
  check(store.includes(`href="/homes/store/${id}"`), `${id}: the store's list does not link to its page`);
}

if (failures.length) {
  console.error(`\n✗ collection pages FAILED (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`✓ collection pages passed — ${products.length} products, each with its page, linked from the store`);
