import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findRelatedPosts } from '../src/utils/related-posts.ts';

const post = (id: string, data: Record<string, unknown>): any => ({
  id,
  data: { tags: [], authors: [], publishDate: new Date('2026-01-01'), ...data },
});

// Current post, far in the future so candidates below get no recency bonus.
const current = post('cur', {
  category: 'A',
  tags: ['x', 'y'],
  authors: ['jane'],
  series: { name: 'S', order: 1 },
  publishDate: new Date('2026-06-01'),
});

test('scores by category/tags/series/author, sorts desc, excludes self + zero-score', () => {
  const posts = [
    current, // self → excluded
    post('cat', { category: 'A', publishDate: new Date('2026-01-02') }), // +3
    post('tagAuth', { tags: ['x', 'y'], authors: ['jane'], publishDate: new Date('2026-01-01') }), // +2 +1 = 3
    post('series', { series: { name: 'S', order: 2 }, publishDate: new Date('2026-01-01') }), // +2
    post('none', { tags: ['z'], publishDate: new Date('2026-01-01') }), // 0 → excluded
  ];
  const related = findRelatedPosts(current, posts);
  // cat(3) and tagAuth(3) tie → newer publishDate wins (cat is 01-02 > 01-01); series(2) last.
  assert.deepEqual(related.map((p) => p.id), ['cat', 'tagAuth', 'series']);
});

test('respects the count limit', () => {
  const posts = [
    post('a', { category: 'A', publishDate: new Date('2026-01-03') }),
    post('b', { category: 'A', publishDate: new Date('2026-01-02') }),
    post('c', { category: 'A', publishDate: new Date('2026-01-01') }),
  ];
  assert.deepEqual(findRelatedPosts(current, posts, 2).map((p) => p.id), ['a', 'b']);
});

test('gives a recency bonus within 30 days', () => {
  const near = post('near', { tags: ['z'], publishDate: new Date('2026-05-20') }); // no tag match, but ~12 days → +1
  const far = post('far', { tags: ['z'], publishDate: new Date('2026-01-01') }); // >30 days → 0 (excluded)
  const related = findRelatedPosts(current, [near, far]);
  assert.deepEqual(related.map((p) => p.id), ['near']);
});
