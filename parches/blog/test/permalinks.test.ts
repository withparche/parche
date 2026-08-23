import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  localizePath,
  resolvePostPermalink,
  resolveTaxonomyPermalink,
  permalinkToRoutePattern,
} from '../src/types.ts';

/** Minimal post shape — only the fields the resolver reads. */
const post = (id: string, data: Record<string, unknown> = {}): any => ({
  id,
  data: { publishDate: new Date('2026-03-09T10:20:30Z'), ...data },
});

test('localizePath: the default locale is never prefixed', () => {
  assert.equal(localizePath('/blog/hello', 'en', 'en'), '/blog/hello');
  assert.equal(localizePath('/blog/hello', 'es', 'en'), '/es/blog/hello');
});

test('localizePath: missing locale info leaves the path untouched', () => {
  assert.equal(localizePath('/blog', undefined, 'en'), '/blog');
  assert.equal(localizePath('/blog', 'es', undefined), '/blog');
});

test('localizePath: normalizes a path with no leading slash', () => {
  assert.equal(localizePath('blog/hello', 'es', 'en'), '/es/blog/hello');
});

test('resolvePostPermalink: locale prefix is applied after substitution', () => {
  const p = post('es/mi-post');
  assert.equal(resolvePostPermalink('/blog/%slug%', p, 'es', 'en'), '/es/blog/mi-post');
  assert.equal(resolvePostPermalink('/%slug%', p, 'es', 'en'), '/es/mi-post');
});

test('resolvePostPermalink: default locale and omitted locale both stay bare', () => {
  const p = post('en/hello');
  assert.equal(resolvePostPermalink('/blog/%slug%', p, 'en', 'en'), '/blog/hello');
  assert.equal(resolvePostPermalink('/blog/%slug%', p), '/blog/hello');
});

test('resolvePostPermalink: urlSlug wins over the post key', () => {
  const p = post('es/mi-post', { urlSlug: 'otro-slug' });
  assert.equal(resolvePostPermalink('/%slug%', p, 'es', 'en'), '/es/otro-slug');
});

test('resolvePostPermalink: date and category segments still substitute', () => {
  const p = post('es/mi-post', { category: 'Guías Prácticas' });
  assert.equal(
    resolvePostPermalink('/%year%/%month%/%slug%', p, 'es', 'en'),
    '/es/2026/03/mi-post',
  );
  // Accents are transliterated, not deleted: "Guías Prácticas" → "guias-practicas".
  assert.equal(resolvePostPermalink('/%category%/%slug%', p, 'en', 'en'), '/guias-practicas/mi-post');
});

test('resolveTaxonomyPermalink: prefixes tags, categories, authors and series', () => {
  assert.equal(resolveTaxonomyPermalink('/blog/tag/%tag%', 'Astro', 'es', 'en'), '/es/blog/tag/astro');
  assert.equal(resolveTaxonomyPermalink('/blog/category/%category%', 'Guides', 'en', 'en'), '/blog/category/guides');
  assert.equal(resolveTaxonomyPermalink('/blog/series/%series%', 'My Series', 'es', 'en'), '/es/blog/series/my-series');
});

test('permalinkToRoutePattern is unaffected by localization', () => {
  // Route patterns stay unprefixed — core injects one route per locale.
  assert.equal(permalinkToRoutePattern('/blog/%slug%'), 'blog/[slug]');
  assert.equal(permalinkToRoutePattern('/%year%/%month%/%slug%'), '[year]/[month]/[slug]');
});
