import { test } from 'node:test';
import assert from 'node:assert/strict';
import { entryPath, metadataFor, propsFor, type CollectionPages } from '../src/pages.ts';
import createCollectionPages from '../src/index.ts';

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

test('a path without %slug% or a missing widget stops the config', () => {
  assert.throws(() => createCollectionPages({ products: { path: '/store', widget: 'Hero' } }), /%slug%/);
  assert.throws(() => createCollectionPages({ products: { path: '/store/%slug%', widget: '' } }), /widget/);
  const m = createCollectionPages({ products: spec });
  assert.equal(m.name, 'collection-pages');
  assert.match(String(m.urls?.products), /urls\.ts$/);
});
