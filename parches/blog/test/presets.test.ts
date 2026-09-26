import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveBlogConfig, resolveAuthorHref, BLOG_PRESETS } from '../src/types.ts';
import { blogConfigSchema, validateBlogConfig } from '../src/config-schema.ts';

test('no preset is the company preset: several writers, no series, three related posts', () => {
  const cfg = resolveBlogConfig();
  assert.equal(cfg.preset, 'company');
  assert.equal(cfg.authors, 'many');
  assert.equal(cfg.series, false);
  assert.equal(cfg.relatedPostsCount, 3);
});

test('each preset sets its structure', () => {
  assert.deepEqual(
    Object.fromEntries(Object.keys(BLOG_PRESETS).map((p) => {
      const c = resolveBlogConfig({ preset: p as any });
      return [p, [c.authors, c.series, c.relatedPostsCount]];
    })),
    { personal: ['one', true, 3], company: ['many', false, 3], magazine: ['many', true, 3], newsletter: ['one', false, 0] },
  );
});

test('a key given explicitly wins over the preset', () => {
  const cfg = resolveBlogConfig({ preset: 'personal', authors: 'many', series: false, relatedPostsCount: 5 });
  assert.equal(cfg.authors, 'many');
  assert.equal(cfg.series, false);
  assert.equal(cfg.relatedPostsCount, 5);
  assert.equal(resolveBlogConfig({ preset: 'newsletter', relatedPostsCount: 2 }).relatedPostsCount, 2);
});

test('one writer links to the About page; several link to their own page', () => {
  const one = resolveBlogConfig({ preset: 'personal' });
  assert.equal(resolveAuthorHref(one, 'Jane Doe'), '/about');
  assert.equal(resolveAuthorHref(one, 'Jane Doe', 'es', 'en'), '/es/about');
  assert.equal(resolveAuthorHref(resolveBlogConfig({ preset: 'personal', aboutPath: '/me' }), 'x'), '/me');
  assert.equal(resolveAuthorHref(resolveBlogConfig(), 'jane'), '/blog/author/jane');
});

test('options are validated: an unknown key or a wrong value is named', () => {
  assert.doesNotThrow(() => validateBlogConfig(undefined));
  assert.doesNotThrow(() => validateBlogConfig({ preset: 'magazine', postsPerPage: 6, permalinks: { post: '/%slug%' } }));
  assert.throws(() => validateBlogConfig({ preset: 'zine' }), /preset/);
  assert.throws(() => validateBlogConfig({ postPerPage: 6 }), /unknown option\(s\) "postPerPage"/);
  assert.throws(() => validateBlogConfig({ permalinks: { post: 'blog/%slug%' } }), /permalinks\.post: a permalink starts with "\/"/);
  assert.throws(() => validateBlogConfig({ permalinks: { page: '/x' } }), /permalinks: unknown option\(s\) "page"/);
});

test('every option the resolver reads is one the schema accepts, and back', () => {
  const resolved = Object.keys(resolveBlogConfig());
  const accepted = Object.keys(blogConfigSchema.shape);
  assert.deepEqual([...accepted].sort(), [...resolved].sort());
});
