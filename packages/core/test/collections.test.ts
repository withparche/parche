import { test } from 'node:test';
import assert from 'node:assert/strict';
import { entryPath, metadataFor, propsFor, type CollectionPages } from '../src/content/collections.ts';
import { siteConfigSchema } from '../src/types/config.ts';
import { createRegistry } from '../src/integration/registry.ts';

const spec: CollectionPages = { path: '/store/%slug%', widget: 'pattern/product-page' };
const lamp = { id: 'moss-weekender', data: { name: 'The Moss weekender', price: '£248', summary: 'Waxed canvas.', photos: [{ caption: 'front' }], specs: [], internalCode: 'MW-01' } };

test('an entry is served at its path, with its slug or its id, in its locale', () => {
  assert.equal(entryPath(spec, lamp, ['en', 'es'], 'en'), '/store/moss-weekender');
  assert.equal(entryPath(spec, { id: 'es/lampara', data: {} }, ['en', 'es'], 'en'), '/es/store/lampara');
  assert.equal(entryPath(spec, { id: 'x', data: { slug: 'nice-name' } }, ['en'], 'en'), '/store/nice-name');
});

test('the widget gets the fields it declares by name, the mapped ones, and nothing else', () => {
  assert.deepEqual(propsFor(spec, lamp, ['name', 'price', 'specs']), { name: 'The Moss weekender', price: '£248', specs: [] });
  const hero = { ...spec, widget: 'Hero', props: { title: 'name', subtitle: 'summary', image: 'photos.0' } };
  assert.deepEqual(propsFor(hero, lamp, ['title', 'subtitle', 'image', 'tagline']), { title: 'The Moss weekender', subtitle: 'Waxed canvas.', image: { caption: 'front' } });
  // No declaration known: every field goes through.
  assert.equal(Object.keys(propsFor(spec, lamp, null)).length, Object.keys(lamp.data).length);
});

test("the page's title and description come from the fields named, else the usual ones", () => {
  assert.deepEqual(metadataFor(spec, lamp), { title: 'The Moss weekender', description: 'Waxed canvas.', image: undefined });
  assert.deepEqual(metadataFor({ ...spec, metadata: { title: 'price', image: 'photos.0.caption' } }, lamp), { title: '£248', description: 'Waxed canvas.', image: 'front' });
});

test('a path without %slug% or a missing widget stops the site config', () => {
  const site = (collections: unknown) => siteConfigSchema.safeParse({ brand: { name: 'X' }, collections });
  assert.equal(site({ products: spec }).success, true);
  assert.match(JSON.stringify(site({ products: { path: '/store', widget: 'Hero' } }).error?.issues), /%slug%/);
  assert.equal(site({ products: { path: '/store/%slug%', widget: '' } }).success, false);
  assert.equal(site({ products: { ...spec, colour: 'red' } }).success, false);
});

test('a collection with pages gets an address for its entries and core resolves its pages', () => {
  const config = siteConfigSchema.parse({ brand: { name: 'X' }, collections: { products: spec } });
  const reg = createRegistry({ parches: [] }, '/tmp/parche-test-root', undefined, config);
  assert.match(reg.entryUrls.products, /utils[\\/]collection-urls\.ts$/);
  assert.equal(reg.resolvers.length, 1);
  assert.match(reg.resolvers[0].entrypoint, /utils[\\/]collections\.ts$/);
  // None named: nothing is registered.
  assert.equal(createRegistry({ parches: [] }, '/tmp/parche-test-root').resolvers.length, 0);
});

test('a collection an app already serves cannot be named in the site config', () => {
  const config = siteConfigSchema.parse({ brand: { name: 'X' }, collections: { posts: { path: '/p/%slug%', widget: 'Hero' } } });
  const blog = { name: 'blog', urls: { posts: '/x/urls.ts' } };
  assert.throws(() => createRegistry({ parches: [blog] }, '/tmp/parche-test-root', undefined, config), /"blog" already serves the "posts" collection/);
});
