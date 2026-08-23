import { test } from 'node:test';
import assert from 'node:assert/strict';
import { termFrom, termFromSlug } from '../src/utils/taxonomy-rules.ts';

/** Build a declared-terms map the way the collection loader would. */
const declare = (...terms: Array<Record<string, unknown>>) =>
  new Map(terms.map((t) => [String(t.key).toLowerCase(), t as any]));

const NONE = new Map<string, any>();

test('undeclared term: title and slug keep the previous behaviour', () => {
  const t = termFrom(NONE, 'Tutorials');
  assert.equal(t.key, 'Tutorials');
  assert.equal(t.title, 'Tutorials');
  assert.equal(t.slug, 'tutorials');
  assert.equal(t.description, undefined);
});

test('undeclared term: a lowercase value is capitalized for display only', () => {
  const t = termFrom(NONE, 'astro');
  assert.equal(t.title, 'Astro');
  assert.equal(t.slug, 'astro');
});

test('declared term overrides title, slug and description', () => {
  const declared = declare({ key: 'design', title: 'Diseño', slug: 'diseno', description: 'Sobre diseño.' });
  const t = termFrom(declared, 'design');
  assert.equal(t.key, 'design');       // the queries still match on the raw value
  assert.equal(t.title, 'Diseño');
  assert.equal(t.slug, 'diseno');
  assert.equal(t.description, 'Sobre diseño.');
});

test('declaring is case-insensitive against frontmatter', () => {
  const declared = declare({ key: 'Tutorials', title: 'Tutoriales', slug: 'tutoriales' });
  assert.equal(termFrom(declared, 'tutorials').slug, 'tutoriales');
  assert.equal(termFrom(declared, 'TUTORIALS').slug, 'tutoriales');
});

test('a declared term with no slug falls back to the default shape', () => {
  const declared = declare({ key: 'astro', title: 'Astro' });
  assert.equal(termFrom(declared, 'astro').slug, 'astro');
});

// --- reverse direction: URL segment back to the frontmatter value ---

test('slug lookup finds an undeclared term through the values in use', () => {
  const t = termFromSlug(NONE, 'tutorials', ['Tutorials', 'Guides']);
  assert.equal(t?.key, 'Tutorials');
  assert.equal(t?.slug, 'tutorials');
});

test('slug lookup resolves a declared slug to its frontmatter value', () => {
  const declared = declare({ key: 'design', title: 'Diseño', slug: 'diseno' });
  const t = termFromSlug(declared, 'diseno', ['design']);
  assert.equal(t?.key, 'design');
  assert.equal(t?.title, 'Diseño');
});

test('a declared term is NOT reachable at its default slug', () => {
  // Otherwise /tag/design and /tag/diseno would both render — duplicate content.
  const declared = declare({ key: 'design', title: 'Diseño', slug: 'diseno' });
  assert.equal(termFromSlug(declared, 'design', ['design']), null);
});

test('an unknown slug resolves to null so the route can 404', () => {
  assert.equal(termFromSlug(NONE, 'nonexistent', ['Tutorials']), null);
  // A term declared for another locale is not in this locale's values either.
  const declared = declare({ key: 'seo', title: 'SEO' });
  assert.equal(termFromSlug(declared, 'performance', ['seo']), null);
});

test('slug lookup is case-insensitive', () => {
  assert.equal(termFromSlug(NONE, 'TUTORIALS', ['Tutorials'])?.key, 'Tutorials');
});
