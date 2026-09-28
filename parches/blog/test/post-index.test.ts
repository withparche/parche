import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPostIndex } from '../src/utils/post-index.ts';

/** Minimal post factory — only the fields the index reads. */
const post = (id: string, data: Record<string, unknown> = {}): any => ({
  id,
  data: {
    title: id,
    tags: [],
    authors: [],
    publishDate: new Date('2026-01-01'),
    draft: false,
    ...data,
  },
});

const posts = [
  post('en/hello', { publishDate: new Date('2026-01-10'), tags: ['astro', 'css'], category: 'Guides' }),
  post('es/hello', { publishDate: new Date('2026-01-10'), urlSlug: 'hola', tags: ['astro'], category: 'Guías' }),
  post('en/older', { publishDate: new Date('2025-06-01'), tags: ['css'], category: 'Guides', series: { name: 'Basics', order: 1 } }),
  post('en/secret', { publishDate: new Date('2026-02-01'), draft: true }),
  post('fr/hello', { publishDate: new Date('2026-01-12'), urlSlug: 'bonjour', draft: true }),
];

test('published: a locale\'s posts newest first, drafts left out unless asked', () => {
  const index = buildPostIndex(posts, 'en');
  assert.deepEqual(index.published('en').map((p) => p.id), ['en/hello', 'en/older']);
  assert.deepEqual(index.published('es').map((p) => p.id), ['es/hello']);
  assert.deepEqual(index.published('fr'), []);
  assert.deepEqual(index.all.map((p) => p.id), ['en/hello', 'es/hello', 'en/older']);
  assert.deepEqual(buildPostIndex(posts, 'en', true).published('en').map((p) => p.id), ['en/secret', 'en/hello', 'en/older']);
});

test('bySlug: the key, or the urlSlug, in the address\'s locale', () => {
  const index = buildPostIndex(posts, 'en');
  assert.equal(index.bySlug('hello', 'en')?.id, 'en/hello');
  assert.equal(index.bySlug('hola', 'es')?.id, 'es/hello');
  // A translation is not served under its file name, nor under another locale's slug.
  assert.equal(index.bySlug('hello', 'es'), undefined);
  assert.equal(index.bySlug('hola', 'en'), undefined);
  // A draft is not served unless drafts are shown.
  assert.equal(index.bySlug('secret', 'en'), undefined);
  assert.equal(buildPostIndex(posts, 'en', true).bySlug('secret', 'en')?.id, 'en/secret');
});

test('bySlug: two posts at one address — the newest wins, as a scan of the sorted list did', () => {
  const index = buildPostIndex([post('en/a', { urlSlug: 'same', publishDate: new Date('2026-01-01') }), post('en/b', { urlSlug: 'same', publishDate: new Date('2026-03-01') })], 'en');
  assert.equal(index.bySlug('same', 'en')?.id, 'en/b');
});

test('a post without a locale folder belongs to the default locale', () => {
  const index = buildPostIndex([post('plain')], 'de');
  assert.equal(index.published('de')[0]?.id, 'plain');
  assert.equal(index.bySlug('plain', 'de')?.id, 'plain');
  assert.deepEqual(index.translations('plain').map((t) => t.locale), ['de']);
});

test('translations: every locale that publishes the key, itself included', () => {
  const index = buildPostIndex(posts, 'en');
  assert.deepEqual(index.translations('hello').map((t) => [t.locale, t.post.id]), [['en', 'en/hello'], ['es', 'es/hello']]);
  assert.deepEqual(index.translations('older').map((t) => t.locale), ['en']);
  assert.deepEqual(index.translations('nope'), []);
  // The French draft counts once drafts are shown.
  assert.deepEqual(buildPostIndex(posts, 'en', true).translations('hello').map((t) => t.locale), ['fr', 'en', 'es']);
});

test('terms: a locale\'s tags and categories with counts, and its series', () => {
  const index = buildPostIndex(posts, 'en');
  const en = index.terms('en');
  assert.deepEqual([...en.tags], [['astro', 1], ['css', 2]]);
  assert.deepEqual([...en.categories], [['Guides', 2]]);
  assert.deepEqual(en.series, ['Basics']);
  assert.deepEqual([...index.terms('es').categories], [['Guías', 1]]);
  assert.deepEqual(index.terms('fr').series, []);
  // Computed once: the same object comes back.
  assert.equal(index.terms('en'), en);
  // Without a locale: every locale's.
  assert.deepEqual([...index.terms().tags], [['astro', 2], ['css', 2]]);
  assert.deepEqual(index.published().map((p) => p.id), ['en/hello', 'es/hello', 'en/older']);
});
