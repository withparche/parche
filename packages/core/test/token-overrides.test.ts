import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokensToCss, validateOverrides } from '../src/config/token-overrides.ts';

test('overrides become CSS with the selectors the tokens and themes use', () => {
  const css = tokensToCss({
    base: { light: { '--ds-sys-color-primary': 'oklch(0.5 0.1 150)' }, dark: { '--ds-sys-color-primary': 'oklch(0.7 0.1 150)' } },
    themes: { product: { light: { '--ds-conf-radius-scale': '0.5' }, dark: { '--ds-sys-color-surface': 'oklch(0.2 0 0)' } } },
  });
  assert.equal(
    css,
    ':root {\n  --ds-sys-color-primary: oklch(0.5 0.1 150);\n}\n.dark {\n  --ds-sys-color-primary: oklch(0.7 0.1 150);\n}\n' +
      ':root[data-theme="product"] {\n  --ds-conf-radius-scale: 0.5;\n}\n:root[data-theme="product"].dark {\n  --ds-sys-color-surface: oklch(0.2 0 0);\n}\n',
  );
  assert.equal(tokensToCss({}), '');
});

test('what cannot be written safely is left out and named', () => {
  const known = new Set(['--ds-sys-color-primary']);
  const { overrides, issues } = validateOverrides(
    {
      base: { light: { '--ds-sys-color-primary': 'red', '--ds-sys-color-nope': 'red', color: 'red', '--ds-sys-color-primary ': 'x', '--ds-comp-card-padding': '1rem' }, dark: { '--ds-sys-color-primary': 'red; } body { display:none' } },
      themes: { 'Evil"]{': { light: { '--ds-sys-color-primary': 'red' } }, product: { light: { '--ds-sys-color-primary': '</style><script>' } } },
    },
    known,
  );
  assert.deepEqual(overrides, { base: { light: { '--ds-sys-color-primary': 'red', '--ds-comp-card-padding': '1rem' } } });
  assert.deepEqual(issues.map((i) => i.path).sort(), [
    'base.dark.--ds-sys-color-primary',
    'base.light.--ds-sys-color-nope',
    'base.light.--ds-sys-color-primary ',
    'base.light.color',
    'themes.Evil"]{',
    'themes.product.light.--ds-sys-color-primary',
  ]);
});
