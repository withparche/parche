import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractPostLocale,
  getPublishedPosts,
  getFeaturedPosts,
  getPostsByTag,
  getPostsByCategory,
  getPostsByAuthor,
  getPostsBySeries,
  getAllTags,
  getAllCategories,
  getAllSeries,
} from '../src/utils/post-helpers.ts';

/** Minimal post factory — only the fields the helpers read. */
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

test('extractPostLocale: splits "{locale}/{key}", falls back to default', () => {
  assert.deepEqual(extractPostLocale('en/my-post'), { locale: 'en', postKey: 'my-post' });
  assert.deepEqual(extractPostLocale('es/guide/intro'), { locale: 'es', postKey: 'guide/intro' });
  assert.deepEqual(extractPostLocale('loose'), { locale: 'en', postKey: 'loose' });
  assert.deepEqual(extractPostLocale('loose', 'de'), { locale: 'de', postKey: 'loose' });
});

test('getPublishedPosts: drops drafts, sorts by publishDate desc', () => {
  const posts = [
    post('en/a', { publishDate: new Date('2026-01-10') }),
    post('en/b', { publishDate: new Date('2026-03-01') }),
    post('en/c', { publishDate: new Date('2026-02-01'), draft: true }),
  ];
  const pub = getPublishedPosts(posts);
  assert.deepEqual(pub.map((p) => p.id), ['en/b', 'en/a']); // c is draft, sorted desc
});

test('getPublishedPosts: showDrafts keeps drafts; locale filters', () => {
  const posts = [
    post('en/a'),
    post('es/b'),
    post('en/c', { draft: true }),
  ];
  assert.equal(getPublishedPosts(posts, true).length, 3);
  assert.deepEqual(getPublishedPosts(posts, false, 'en').map((p) => p.id), ['en/a']);
});

test('getFeaturedPosts: only featured, still published', () => {
  const posts = [post('en/a', { featured: true }), post('en/b'), post('en/c', { featured: true, draft: true })];
  assert.deepEqual(getFeaturedPosts(posts).map((p) => p.id), ['en/a']);
});

test('getPostsByTag / Category / Author: case-insensitive filters', () => {
  const posts = [
    post('en/a', { tags: ['Astro', 'SSR'], category: 'Guides', authors: ['jane'] }),
    post('en/b', { tags: ['design'], category: 'News', authors: ['bob'] }),
  ];
  assert.deepEqual(getPostsByTag(posts, 'astro').map((p) => p.id), ['en/a']);
  assert.deepEqual(getPostsByCategory(posts, 'guides').map((p) => p.id), ['en/a']);
  assert.deepEqual(getPostsByAuthor(posts, 'BOB').map((p) => p.id), ['en/b']);
});

test('getPostsBySeries: filters by name, sorts by series order', () => {
  const posts = [
    post('en/p2', { series: { name: 'Deep Dive', order: 2 } }),
    post('en/p1', { series: { name: 'Deep Dive', order: 1 } }),
    post('en/x', { series: { name: 'Other', order: 1 } }),
  ];
  assert.deepEqual(getPostsBySeries(posts, 'Deep Dive').map((p) => p.id), ['en/p1', 'en/p2']);
});

test('getAllTags / Categories / Series: aggregate with counts', () => {
  const posts = [
    post('en/a', { tags: ['x', 'y'], category: 'Guides', series: { name: 'S', order: 1 } }),
    post('en/b', { tags: ['x'], category: 'Guides' }),
  ];
  assert.equal(getAllTags(posts).get('x'), 2);
  assert.equal(getAllTags(posts).get('y'), 1);
  assert.equal(getAllCategories(posts).get('Guides'), 2);
  assert.deepEqual(getAllSeries(posts), ['S']);
});
