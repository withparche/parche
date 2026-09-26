import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { navRefs, schemaAt } from '../src/server/usage.ts';
import { pageUrl } from '../src/shared/page-url.ts';
import { pagesShowing, previewSrc } from '../src/editor/preview/through.ts';

const UI = fileURLToPath(new URL('../../../parches/ui/src/', import.meta.url));

test('a menu is found wherever a node takes it: at the top of its props, deeper, or inside a slot', () => {
  const refs = navRefs([
    { widget: 'Header', props: { links: { $ref: 'navigation/main' } } },
    { widget: 'Section', slots: { default: [{ widget: 'Footer', props: { columns: [{ title: 'More', links: { $ref: 'navigation/legal#items' } }] } }] } },
    // A pointer somewhere else in the entry is not the menu's items.
    { widget: 'Hero', props: { title: { $ref: 'navigation/main#label' } } },
    { widget: 'Features', props: { items: { $ref: 'presets/faq' } } },
  ]);
  assert.deepEqual(refs, [
    { widget: 'Header', prop: ['links'], ref: 'navigation/main' },
    { widget: 'Footer', prop: ['columns', 0, 'links'], ref: 'navigation/legal' },
  ]);
});

test("a menu's items take the schema of the prop that uses it: Header links", async () => {
  const { schema } = await import(`${UI}layout/Header.props.ts`);
  const items = schemaAt(z.toJSONSchema(schema), ['links']) as { type: string; items: { properties: Record<string, unknown>; required: string[] } };
  assert.equal(items.type, 'array');
  assert.ok(items.items.properties.label && items.items.properties.href && items.items.properties.children);
  assert.deepEqual(items.items.required, ['label']);
});

test('the schema at a path goes through $defs, unions and array items', () => {
  const root = {
    type: 'object',
    properties: { columns: { type: 'array', items: { $ref: '#/$defs/column' } }, maybe: { anyOf: [{ type: 'null' }, { type: 'object', properties: { x: { type: 'string' } } }] } },
    $defs: { column: { type: 'object', properties: { links: { type: 'array', items: { type: 'string' } } } } },
  };
  assert.deepEqual(schemaAt(root, ['columns', 0, 'links']), { type: 'array', items: { type: 'string' }, $defs: root.$defs });
  assert.deepEqual(schemaAt(root, ['maybe', 'x']), { type: 'string', $defs: root.$defs });
  assert.equal(schemaAt(root, ['nope']), null);
});

test("a page's URL: the locale prefix unless default, home at the root, urlSlug over the name", () => {
  assert.equal(pageUrl('en/home', undefined, 'en'), '/');
  assert.equal(pageUrl('es/home', undefined, 'en'), '/es');
  assert.equal(pageUrl('en/landing/sale', undefined, 'en'), '/landing/sale');
  assert.equal(pageUrl('es/about', 'acerca', 'en'), '/es/acerca');
  assert.equal(pageUrl('about', undefined, 'en'), '/about');
});

test('a layout or a menu previews through a page that uses it, the chosen one when it still does', () => {
  const catalog = {
    i18n: { locales: ['en'], defaultLocale: 'en' },
    layouts: [
      { id: 'en/default', locale: 'en', name: 'default', outlets: ['default'], usedBy: ['en/home', 'en/about'] },
      { id: 'en/docs', locale: 'en', name: 'docs', outlets: ['default', 'aside'], usedBy: ['en/docs'] },
    ],
    navigation: [
      { id: 'en/main', locale: 'en', name: 'main', usedBy: [{ doc: 'layouts/en/default', widget: 'Header', prop: 'links' }, { doc: 'pages/en/docs', widget: 'Header', prop: 'links' }], itemsSchema: null },
      { id: 'en/unused', locale: 'en', name: 'unused', usedBy: [], itemsSchema: null },
    ],
    pageUrls: { 'en/home': '/', 'en/about': '/about-us', 'en/docs': '/docs' },
  } as never;
  const doc = (collection: string, id: string, data = {}) => ({ collection, id, key: `${collection}/${id}`, data }) as never;
  assert.deepEqual(pagesShowing(doc('navigation', 'en/main'), catalog), ['en/home', 'en/about', 'en/docs']);
  assert.equal(previewSrc(doc('layouts', 'en/default'), catalog, {}), '/');
  assert.equal(previewSrc(doc('layouts', 'en/default'), catalog, { 'layouts/en/default': 'en/about' }), '/about-us');
  // A choice the document no longer has falls back to the first page.
  assert.equal(previewSrc(doc('layouts', 'en/docs'), catalog, { 'layouts/en/docs': 'en/about' }), '/docs');
  assert.equal(previewSrc(doc('navigation', 'en/unused'), catalog, {}), '/');
  // A page is its own URL, with the urlSlug being edited.
  assert.equal(previewSrc(doc('pages', 'en/about', { urlSlug: 'team' }), catalog, {}), '/team');
});
