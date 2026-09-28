import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createResolver, hasRefs, parseEntryRef, referencedCollections, substituteRefs, type RefEntry } from '../src/content/refs.ts';

const collections: Record<string, RefEntry[]> = {
  navigation: [
    { id: 'en/main', data: { label: 'Main', items: [{ label: 'Docs', href: '/docs' }] } },
    { id: 'es/main', data: { label: 'Principal', items: [{ label: 'Docs', href: '/es/docs' }] } },
    { id: 'social', data: { items: [{ label: 'GitHub', href: 'https://github.com' }] } },
  ],
  authors: [{ id: 'marta', data: { name: 'Marta Ibáñez', role: 'Founder' } }],
  posts: [
    { id: 'en/a', data: { title: 'A', publishDate: new Date('2026-01-01'), tags: ['astro'] } },
    { id: 'en/b', data: { title: 'B', publishDate: new Date('2026-03-01'), tags: ['css'] } },
    { id: 'en/c', data: { title: 'C', publishDate: new Date('2026-02-01'), tags: ['astro'], draft: true } },
    { id: 'es/a', data: { title: 'A es', publishDate: new Date('2026-04-01'), tags: ['astro'] } },
  ],
};
const resolver = (locale?: string) => createResolver((n) => collections[n], locale);

test('parseEntryRef splits collection, id and pointer', () => {
  assert.deepEqual(parseEntryRef('navigation/main'), { collection: 'navigation', id: 'main' });
  assert.deepEqual(parseEntryRef('docs/guides/install#/title'), { collection: 'docs', id: 'guides/install', pointer: ['title'] });
  assert.equal(parseEntryRef('main'), null);
});

test('a menu resolves to its items in the page locale, then without one', () => {
  const nodes = [
    { widget: 'Header', props: { links: { $ref: 'navigation/main' } } },
    { widget: 'Section', slots: { default: [{ widget: 'Footer', props: { socialLinks: { $ref: 'navigation/social' } } }] } },
  ];
  assert.deepEqual([...referencedCollections(nodes)], ['navigation']);
  const { nodes: out, issues } = substituteRefs(nodes, resolver('es'), 'layout');
  assert.deepEqual(out[0].props?.links, [{ label: 'Docs', href: '/es/docs' }]);
  assert.deepEqual(out[1].slots?.default[0].props?.socialLinks, collections.navigation[2].data.items);
  assert.deepEqual(issues, []);
});

test('other collections yield the entry, or the field a pointer names', () => {
  const { nodes } = substituteRefs(
    [{ widget: 'Quote', props: { author: { $ref: 'authors/marta' }, name: { $ref: 'authors/marta#/name' } } }],
    resolver('en'),
  );
  assert.deepEqual(nodes[0].props?.author, { name: 'Marta Ibáñez', role: 'Founder' });
  assert.equal(nodes[0].props?.name, 'Marta Ibáñez');
});

test('a query keeps the locale, leaves drafts out, filters, sorts and limits', () => {
  const { nodes } = substituteRefs(
    [{ widget: 'Posts', props: { items: { $collection: 'posts', sort: '-publishDate', limit: 5 }, astro: { $collection: 'posts', filter: { tags: 'astro' } } } }],
    resolver('en'),
  );
  assert.deepEqual((nodes[0].props?.items as any[]).map((p) => p.id), ['b', 'a']);
  assert.deepEqual((nodes[0].props?.astro as any[]).map((p) => p.title), ['A']);
});

test('broken references are reported with their path and render empty', () => {
  const { nodes, issues } = substituteRefs(
    [{ widget: 'Header', props: { links: { $ref: 'navigation/nope' }, more: { $collection: 'nothing' }, bad: { $ref: 'main' } } }],
    resolver('en'),
  );
  assert.equal(nodes[0].props?.links, undefined);
  assert.deepEqual(nodes[0].props?.more, []);
  assert.deepEqual(
    issues.map((i) => i.path),
    ['sections[0].props.links', 'sections[0].props.more', 'sections[0].props.bad'],
  );
  assert.match(issues[0].message, /no entry "nope" in "navigation"/);
  assert.match(issues[1].message, /no "nothing" collection/);
});

test('an object with other keys beside $ref is data, not a reference', () => {
  const props = { links: { $ref: 'navigation/main', extra: true } };
  assert.equal(hasRefs(props), false);
});

test("a wrapper's props are resolved like the node's own", () => {
  const { nodes, issues } = substituteRefs(
    [{ widget: 'Hero', props: {}, wrapper: { props: { tone: 'dark', author: { $ref: 'authors/marta#/name' }, broken: { $ref: 'authors/nope' } } } }],
    resolver('en'),
  );
  assert.equal((nodes[0].wrapper as any).props.author, 'Marta Ibáñez');
  assert.equal((nodes[0].wrapper as any).props.tone, 'dark');
  assert.deepEqual(issues.map((i) => i.path), ['sections[0].wrapper.props.broken']);
});
