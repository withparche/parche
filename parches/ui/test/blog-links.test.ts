/**
 * The homepage blog widgets resolve post links with their own copy of the
 * blog's permalink rules (ui cannot import the blog parche; the dependency
 * runs the other way). This test holds the copy to the original, pattern by
 * pattern, so a link on the home page is the page the blog builds.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { postHref } from '../src/lib/blog-links.ts';
import { resolvePostPermalink } from '../../blog/src/types.ts';

const posts = [
  { id: 'en/hello-world', data: { publishDate: new Date('2026-03-09T08:05:07'), category: 'Guías rápidas', authors: ['María José'] } },
  { id: 'es/hola', data: { publishDate: new Date('2026-12-31T23:59:59'), urlSlug: 'hola-mundo', category: 'C++ & Rust' } },
  { id: 'plain', data: { publishDate: new Date('2025-01-01T00:00:00') } },
];
const patterns = ['/blog/%slug%', '/%slug%', '/%year%/%month%/%day%/%slug%', '/%category%/%slug%', '/%author%/%hour%-%minute%-%second%/%slug%'];

for (const pattern of patterns) {
  test(`ui and blog agree on ${pattern}`, () => {
    for (const post of posts) {
      for (const locale of ['en', 'es']) {
        assert.equal(postHref(pattern, post, locale, 'en'), resolvePostPermalink(pattern, post, locale, 'en'), `${post.id} in ${locale}`);
      }
    }
  });
}
