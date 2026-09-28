import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPostIndex } from '../src/utils/post-index.ts';
import { relatedPosts } from '../src/utils/related-posts.ts';

const post = (id: string, data: Record<string, unknown> = {}): any => ({
  id,
  data: { title: id, tags: [], authors: [], publishDate: new Date('2026-01-01'), draft: false, ...data },
});

const posts = [
  post('en/a', { category: 'A', related: ['c', 'b', 'a', 'nope'], publishDate: new Date('2026-01-04') }),
  post('en/b', { category: 'A', publishDate: new Date('2026-01-03') }),
  post('en/c', { category: 'B', publishDate: new Date('2026-01-02') }),
  post('en/d', { category: 'A', publishDate: new Date('2026-01-05') }),
  post('en/e', { publishDate: new Date('2026-01-06') }),
  post('en/hidden', { category: 'A', draft: true, publishDate: new Date('2026-01-07') }),
  post('es/b', { category: 'A', publishDate: new Date('2026-01-03') }),
  post('es/d', { category: 'A', related: ['b'], publishDate: new Date('2026-01-05') }),
];
const index = buildPostIndex(posts, 'en');
const byId = (id: string) => posts.find((p) => p.id === id);

test('declared: the keys in their order, in the page\'s locale; itself and unknown keys left out', () => {
  assert.deepEqual(relatedPosts(byId('en/a'), index, 'en').map((p) => p.id), ['en/c', 'en/b']);
  // The Spanish post declares the same key and gets the Spanish translation.
  assert.deepEqual(relatedPosts(byId('es/d'), index, 'es').map((p) => p.id), ['es/b']);
});

test('declared: no topping up beyond what is declared, and the count caps it', () => {
  assert.deepEqual(relatedPosts(byId('en/a'), index, 'en', 1).map((p) => p.id), ['en/c']);
  assert.deepEqual(relatedPosts(byId('en/a'), index, 'en', 5).map((p) => p.id), ['en/c', 'en/b']);
});

test('nothing declared: the latest of the same category first, then the latest of the blog; itself and drafts left out', () => {
  assert.deepEqual(relatedPosts(byId('en/d'), index, 'en').map((p) => p.id), ['en/a', 'en/b', 'en/e']);
  assert.deepEqual(relatedPosts(byId('en/d'), index, 'en', 1).map((p) => p.id), ['en/a']);
  // With drafts shown, the draft counts.
  assert.deepEqual(relatedPosts(byId('en/d'), buildPostIndex(posts, 'en', true), 'en').map((p) => p.id), ['en/hidden', 'en/a', 'en/b']);
});

test('nothing declared and no category: the latest of the blog; a count of zero: none', () => {
  assert.deepEqual(relatedPosts(byId('en/e'), index, 'en').map((p) => p.id), ['en/d', 'en/a', 'en/b']);
  assert.deepEqual(relatedPosts(byId('en/a'), index, 'en', 0), []);
  // The only post of its locale has nothing to offer.
  assert.deepEqual(relatedPosts(post('fr/solo', { category: 'A' }), buildPostIndex([...posts, post('fr/solo', { category: 'A' })], 'en'), 'fr'), []);
});
