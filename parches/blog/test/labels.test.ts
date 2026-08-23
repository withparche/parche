import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_LABELS, resolveLabels, format } from '../src/labels.ts';

test('resolveLabels: no config yields the English defaults', () => {
  const l = resolveLabels(undefined, 'es', 'en');
  assert.equal(l.listingTitle, 'Blog');
  assert.equal(l.emptyState, DEFAULT_LABELS.emptyState);
});

test('resolveLabels: a locale override wins over the defaults', () => {
  const l = resolveLabels({ es: { emptyState: 'No hay publicaciones.' } }, 'es', 'en');
  assert.equal(l.emptyState, 'No hay publicaciones.');
  // Untranslated strings still fall back, so a partial translation has no holes.
  assert.equal(l.newerPosts, DEFAULT_LABELS.newerPosts);
});

test('resolveLabels: the default locale acts as the middle fallback layer', () => {
  const config = {
    en: { listingTitle: 'Journal', olderPosts: 'Older entries' },
    es: { listingTitle: 'Diario' },
  };
  const es = resolveLabels(config, 'es', 'en');
  assert.equal(es.listingTitle, 'Diario');       // own locale wins
  assert.equal(es.olderPosts, 'Older entries');  // inherits the default locale's override
});

test('resolveLabels: an unknown locale falls back cleanly', () => {
  const l = resolveLabels({ es: { listingTitle: 'Diario' } }, 'fr', 'en');
  assert.equal(l.listingTitle, 'Blog');
});

test('format: substitutes named placeholders', () => {
  assert.equal(format('Tag: {value}', { value: 'astro' }), 'Tag: astro');
  assert.equal(format('{count} posts in this series', { count: 3 }), '3 posts in this series');
  assert.equal(format('Part {current} of {total}', { current: 2, total: 5 }), 'Part 2 of 5');
});

test('format: unknown placeholders are left intact rather than blanked', () => {
  assert.equal(format('Tag: {value} ({missing})', { value: 'astro' }), 'Tag: astro ({missing})');
});

test('format: no vars leaves the template untouched', () => {
  assert.equal(format('{minutes} min read'), '{minutes} min read');
});

test('every default label is a non-empty string', () => {
  for (const [key, value] of Object.entries(DEFAULT_LABELS)) {
    assert.equal(typeof value, 'string', `${key} should be a string`);
    assert.ok(value.length > 0, `${key} should not be empty`);
  }
});
