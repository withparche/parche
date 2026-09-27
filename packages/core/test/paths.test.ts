import { test } from 'node:test';
import assert from 'node:assert/strict';
import { absoluteAlternates, localizePath, pagePath, slugify, splitLocale } from '../src/utils/paths.ts';

test('the default locale is never prefixed; the others are', () => {
  assert.equal(localizePath('/blog', 'en', 'en'), '/blog');
  assert.equal(localizePath('/blog', 'es', 'en'), '/es/blog');
  assert.equal(localizePath('blog', 'es', 'en'), '/es/blog');
  assert.equal(localizePath('/blog'), '/blog');
});

test("a page is served at its locale's root when it is home, else at its urlSlug or key", () => {
  assert.equal(pagePath('home', 'en', 'en'), '/');
  assert.equal(pagePath('home', 'es', 'en'), '/es');
  assert.equal(pagePath('landing/sale', 'en', 'en'), '/landing/sale');
  assert.equal(pagePath('about', 'es', 'en', 'acerca'), '/es/acerca');
});

test('an id splits into its locale folder and key; an unknown first segment stays in the key', () => {
  assert.deepEqual(splitLocale('es/about', ['en', 'es'], 'en'), { locale: 'es', key: 'about' });
  assert.deepEqual(splitLocale('landing/sale', ['en', 'es'], 'en'), { locale: 'en', key: 'landing/sale' });
  assert.deepEqual(splitLocale('/es', ['en', 'es'], 'en'), { locale: 'es', key: '' });
});

test('a slug drops accents and joins words', () => {
  assert.equal(slugify('Guías rápidas & más'), 'guias-rapidas-mas');
});

test('alternates become absolute with the site, relative without it', () => {
  assert.deepEqual(absoluteAlternates([{ locale: 'es', path: '/es/blog' }], 'https://x.dev'), [{ locale: 'es', path: '/es/blog', href: 'https://x.dev/es/blog' }]);
  assert.deepEqual(absoluteAlternates([{ locale: 'es', path: '/es/blog' }]), [{ locale: 'es', path: '/es/blog', href: '/es/blog' }]);
});
