import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveBlogConfig } from '../src/types.ts';
import { postPath, viewPaths } from '../src/utils/view-paths.ts';

const posts = [
  { id: 'en/hello', data: { publishDate: '2026-08-01', category: 'Guides', tags: ['astro'], authors: ['jane'] } },
  { id: 'es/hola', data: { publishDate: '2026-08-02', category: 'Guías', urlSlug: 'hola-mundo' } },
];

test("a post's path follows the permalink, in its locale, with its own urlSlug", () => {
  const cfg = resolveBlogConfig({ permalinks: { post: '/%year%/%slug%' } });
  assert.equal(postPath(cfg, posts[0], ['en', 'es'], 'en'), '/2026/hello');
  assert.equal(postPath(cfg, posts[1], ['en', 'es'], 'en'), '/es/2026/hola-mundo');
});

test('each view is shown at the first page that renders it, or nowhere when the blog builds none', () => {
  const views = ['index', 'post', 'taxonomy', 'author', 'series', 'archive', 'subscribe'];
  const company = viewPaths(resolveBlogConfig({ preset: 'company' }), posts, views, 'en');
  assert.deepEqual(company, {
    index: '/blog',
    post: '/blog/hello',
    taxonomy: '/blog/category/guides',
    author: '/blog/author/jane',
    series: null,
    archive: '/blog/archive',
    subscribe: null,
  });
  // One writer: no author pages.
  assert.equal(viewPaths(resolveBlogConfig({ preset: 'personal' }), posts, ['author'], 'en').author, null);
});
