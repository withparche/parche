import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localizeSiteConfig, resolveSiteUrl, resolveI18n } from '../src/utils/site.ts';

// --- per-locale site identity ---

const config: any = {
  site: { name: 'AstroWind', description: 'A free template.', url: 'https://example.com' },
  metadata: { ogImage: '/og.png', twitterHandle: '@x' },
  i18n: { locales: { es: { site: { description: 'Una plantilla gratuita.' } } } },
};

test('localize: a locale with no overrides gets the config untouched', () => {
  assert.equal(localizeSiteConfig(config, 'en'), config);
});

test('localize: only the declared fields are overridden', () => {
  const es = localizeSiteConfig(config, 'es');
  assert.equal(es.site.description, 'Una plantilla gratuita.');
  assert.equal(es.site.name, 'AstroWind');        // inherited
  assert.equal(es.site.url, 'https://example.com'); // inherited
  assert.deepEqual(es.metadata, config.metadata);   // untouched block
});

test('localize: overriding metadata leaves site alone', () => {
  const c: any = { site: { name: 'X' }, metadata: { ogImage: '/a.png' }, i18n: { locales: { es: { metadata: { ogImage: '/b.png' } } } } };
  const es = localizeSiteConfig(c, 'es');
  assert.equal(es.metadata.ogImage, '/b.png');
  assert.equal(es.site.name, 'X');
});

test('localize: the original config is never mutated', () => {
  localizeSiteConfig(config, 'es');
  assert.equal(config.site.description, 'A free template.');
});

// --- one declaration, either side ---

test('site URL: whichever side declares it wins', () => {
  assert.equal(resolveSiteUrl('https://astro.example', undefined), 'https://astro.example');
  assert.equal(resolveSiteUrl(undefined, 'https://parche.example'), 'https://parche.example');
  assert.equal(resolveSiteUrl(undefined, undefined), '');
});

test('site URL: declaring it twice is an error naming both places', () => {
  assert.throws(
    () => resolveSiteUrl('https://a.example', 'https://b.example'),
    (err: Error) => {
      assert.match(err.message, /declared twice/);
      assert.match(err.message, /astro\.config/);
      assert.match(err.message, /site\.url/);
      return true;
    },
  );
});

test('i18n: nothing to do when only Astro declares it', () => {
  assert.equal(resolveI18n({ defaultLocale: 'en', locales: ['en', 'es'] }, undefined), null);
  assert.equal(resolveI18n({ defaultLocale: 'en', locales: ['en'] }, { locales: {} }), null);
});

test('i18n: a Parche-only declaration is handed to Astro', () => {
  const out = resolveI18n(undefined, { defaultLocale: 'en', locales: { en: {}, es: {} } });
  assert.deepEqual(out, { defaultLocale: 'en', locales: ['en', 'es'], routing: 'manual' });
});

test('i18n: the locale map alone is enough — its first key is the default', () => {
  const out = resolveI18n(undefined, { locales: { es: {}, en: {} } });
  assert.equal(out?.defaultLocale, 'es');
  assert.deepEqual(out?.locales, ['es', 'en']);
});

test('i18n: routing is forced to manual, since Parche resolves URLs itself', () => {
  assert.equal(resolveI18n(undefined, { defaultLocale: 'en', locales: { en: {} } })?.routing, 'manual');
});

test('i18n: declaring it on both sides is an error', () => {
  assert.throws(
    () => resolveI18n({ defaultLocale: 'en', locales: ['en'] }, { defaultLocale: 'es', locales: { es: {} } }),
    /declared twice/,
  );
});
