import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  prepareParcheConfig,
  resolveExtends,
  parchePreset,
  type ParcheConfigContext,
} from '../src/integration/index.ts';
import { satisfiesVersion } from '../src/integration/registry.ts';
import { defineConfig } from '../src/types/config.ts';

const CTX: ParcheConfigContext = {
  command: 'build',
  mode: 'production',
  env: {},
  tenant: undefined,
};

// --- prepareParcheConfig: the two site-config modes + function form ---------

test('prepareParcheConfig: inline mode serves the validated site config', () => {
  const prepared = prepareParcheConfig(
    { site: { name: 'Acme', description: 'x' }, parches: [{ name: 'ui' }] },
    CTX,
  );
  assert.equal(prepared.inlineSiteConfig?.site.name, 'Acme');
  assert.equal((prepared.userConfig as any).site, undefined, 'site must not leak into userConfig');
  assert.equal(prepared.userConfig.config, undefined);
  assert.equal(prepared.userConfig.parches?.length, 1);
  assert.equal(prepared.allowAICrawlers, true);
});

test('prepareParcheConfig: separate-file mode passes the config path, no inline', () => {
  const prepared = prepareParcheConfig(
    { parches: [{ name: 'ui' }], config: './parche.config.ts' },
    CTX,
  );
  assert.equal(prepared.inlineSiteConfig, undefined);
  assert.equal(prepared.userConfig.config, './parche.config.ts');
});

test('prepareParcheConfig: function form receives ctx and its result is used', () => {
  const prepared = prepareParcheConfig(
    (ctx) => ({
      site: { name: 'T', description: '', url: ctx.env.SITE_URL ?? 'https://fallback' },
      parches: [],
    }),
    { ...CTX, env: { SITE_URL: 'https://from-env' } },
  );
  assert.equal(prepared.inlineSiteConfig?.site.url, 'https://from-env');
});

test('prepareParcheConfig: seo.allowAICrawlers is read; site SEO does not leak to userConfig', () => {
  const prepared = prepareParcheConfig(
    { config: './parche.config.ts', seo: { allowAICrawlers: false } as any },
    CTX,
  );
  assert.equal(prepared.allowAICrawlers, false);
  assert.equal((prepared.userConfig as any).seo, undefined);
});

// --- resolveExtends: preset composition ------------------------------------

test('resolveExtends: parches concatenate (preset first), leaves win per leaf', () => {
  const preset = parchePreset({ parches: [{ name: 'base' }], routes: { pages: true } });
  const merged = resolveExtends({
    extends: preset,
    parches: [{ name: 'local' }],
  } as any);
  assert.deepEqual(merged.parches?.map((p) => p.name), ['base', 'local']);
  assert.equal(merged.routes?.pages, true);
  assert.equal((merged as any).extends, undefined, 'extends key is stripped');
});

test('resolveExtends: config overrides preset per leaf; objects deep-merge', () => {
  const preset = parchePreset({ themes: { showPanel: true }, overrides: { a: '/a' } });
  const merged = resolveExtends({
    extends: preset,
    themes: { showPanel: false },
    overrides: { b: '/b' },
  } as any);
  assert.equal(merged.themes?.showPanel, false);
  assert.deepEqual(merged.overrides, { a: '/a', b: '/b' });
});

test('resolveExtends: multiple presets apply in order p1 → p2 → config', () => {
  const merged = resolveExtends({
    extends: [parchePreset({ parches: [{ name: '1' }] }), parchePreset({ parches: [{ name: '2' }] })],
    parches: [{ name: '3' }],
  } as any);
  assert.deepEqual(merged.parches?.map((p) => p.name), ['1', '2', '3']);
});

test('resolveExtends: no extends returns the config unchanged', () => {
  const cfg = { parches: [{ name: 'x' }] } as any;
  assert.equal(resolveExtends(cfg), cfg);
});

test('parchePreset is an identity helper', () => {
  const p = { parches: [{ name: 'x' }] };
  assert.equal(parchePreset(p), p);
});

// --- satisfiesVersion: peer version ranges ---------------------------------

test('satisfiesVersion: caret / tilde / >= / exact / prerelease / *', () => {
  const cases: Array<[string, string, boolean]> = [
    ['0.3.5', '^0.3.0', true], // caret 0.x pins the minor
    ['0.4.0', '^0.3.0', false],
    ['1.5.0', '^1.2.0', true], // caret 1.x allows any higher minor
    ['2.0.0', '^1.2.0', false],
    ['1.2.3', '~1.2.0', true],
    ['1.3.0', '~1.2.0', false],
    ['1.2.0', '>=1.0.0', true],
    ['0.9.0', '>=1.0.0', false],
    ['1.2.3', '1.2.3', true],
    ['1.2.4', '1.2.3', false],
    ['0.3.0-alpha.0', '^0.3.0', true], // prerelease suffix ignored
    ['1.0.0', '*', true],
  ];
  for (const [actual, range, expected] of cases) {
    assert.equal(satisfiesVersion(actual, range), expected, `${actual} satisfies ${range}?`);
  }
});

// --- defineConfig (site config): strict, applies defaults ------------------

test('defineConfig: accepts a valid site config and applies defaults', () => {
  const cfg = defineConfig({ site: { name: 'Acme' } });
  assert.equal(cfg.site.name, 'Acme');
  assert.deepEqual(cfg.metadata, {}); // default
});

test('defineConfig: a removed/typo top-level key (e.g. theme) throws, not silently dropped', () => {
  assert.throws(
    () => defineConfig({ site: { name: 'Acme' }, theme: { darkMode: true } } as any),
    /theme|Unrecognized|not allowed|strict/i,
  );
});
