import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRegistry } from '../src/integration/registry.ts';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = '/tmp/parche-test-root';
const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const TABS_DIR = path.join(FIXTURES, 'tabs');

/** Run `fn` with console.warn silenced, returning the captured messages. */
function captureWarnings(fn: () => void): string[] {
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (...args: unknown[]) => warnings.push(args.join(' '));
  try {
    fn();
  } finally {
    console.warn = original;
  }
  return warnings;
}

test('empty config: parche:config points at the default file, no fullBleed', () => {
  const reg = createRegistry({ parches: [] }, ROOT);
  assert.equal(reg.modules['parche:config'], `${ROOT}/src/parche.config.json`);
  assert.deepEqual(reg.fullBleedWidgets, []);
  assert.deepEqual(reg.widgetPropRequirements, []);
});

test('inline site config: parche:config is served inline, not from a file', () => {
  const site = { site: { name: 'X', description: '' } } as any;
  const reg = createRegistry({ parches: [] }, ROOT, undefined, site);
  assert.equal(reg.modules['parche:config'], undefined);
  assert.equal(reg.inlineSiteConfig, site);
});

test('fullBleed widgets are collected from every parche manifest', () => {
  captureWarnings(() => {
    const reg = createRegistry(
      {
        parches: [
          { name: 'ui', widgets: { Hero: '/x/Hero.astro' }, fullBleed: ['Hero'] },
          { name: 'extra', widgets: { Banner: '/x/Banner.astro' }, fullBleed: ['Banner'] },
        ],
      },
      ROOT,
    );
    assert.deepEqual(reg.fullBleedWidgets.sort(), ['Banner', 'Hero']);
  });
});

test('duplicate widget across parches warns (last wins), not silent', () => {
  const warnings = captureWarnings(() => {
    createRegistry(
      {
        parches: [
          { name: 'a', widgets: { Hero: '/a/Hero.astro' } },
          { name: 'b', widgets: { Hero: '/b/Hero.astro' } },
        ],
      },
      ROOT,
    );
  });
  assert.ok(
    warnings.some((w) => /Duplicate registrations/.test(w) && /Hero/.test(w)),
    `expected a collision warning, got: ${warnings.join(' | ')}`,
  );
});

test('requires: missing widget throws with attribution', () => {
  assert.throws(
    () =>
      captureWarnings(() =>
        createRegistry(
          { parches: [{ name: 'needs-hero', requires: { widgets: ['Hero'] } }] },
          ROOT,
        ),
      ),
    /needs-hero.*requires widget "Hero"/s,
  );
});

test('requires: a component supplied via overrides satisfies it', () => {
  // Registering a component through `overrides` resolves the same virtual
  // module a parche would provide, so it has to count. Without this, a project
  // meeting @parche/astro-blog's contract with its own widgets could never build —
  // it had to wrap them in a manifest first, purely to satisfy the check.
  let reg!: ReturnType<typeof createRegistry>;
  captureWarnings(() => {
    reg = createRegistry(
      {
        parches: [{ name: 'blog', requires: { elements: ['Container'], widgets: ['blog/BlogList'] } }],
        overrides: {
          'elements:Container': './src/primitives/Container.astro',
          'widgets:blog:BlogList': './src/widgets/blog/BlogList.astro',
        },
      },
      ROOT,
    );
  });
  assert.equal(reg.modules['parche:elements/Container'], `${ROOT}/src/primitives/Container.astro`);
  assert.equal(reg.modules['parche:widgets/blog/BlogList'], `${ROOT}/src/widgets/blog/BlogList.astro`);
});

test('requires: an unrelated override does not satisfy it', () => {
  assert.throws(
    () =>
      captureWarnings(() =>
        createRegistry(
          {
            parches: [{ name: 'needs-hero', requires: { widgets: ['Hero'] } }],
            overrides: { 'widgets:Other': './src/widgets/Other.astro' },
          },
          ROOT,
        ),
      ),
    /needs-hero.*requires widget "Hero"/s,
  );
});

test('requires: missing template and missing peer parche both throw', () => {
  assert.throws(
    () =>
      createRegistry(
        { parches: [{ name: 'p', requires: { templates: ['nope'], parches: [{ name: 'ghost' }] } }] },
        ROOT,
      ),
    /requires template "nope"[\s\S]*requires parche "ghost"/,
  );
});

test('requires: peer parche present satisfies presence', () => {
  captureWarnings(() => {
    const reg = createRegistry(
      {
        parches: [
          { name: 'ui', version: '1.2.0' },
          { name: 'app', requires: { parches: [{ name: 'ui' }] } },
        ],
      },
      ROOT,
    );
    assert.ok(reg);
  });
});

test('requires: peer version range — satisfied passes, unsatisfied throws', () => {
  const build = (range: string) =>
    createRegistry(
      {
        parches: [
          { name: 'ui', version: '1.5.0' },
          { name: 'app', requires: { parches: [{ name: 'ui', version: range }] } },
        ],
      },
      ROOT,
    );
  // ^1.2.0 is satisfied by 1.5.0
  captureWarnings(() => assert.ok(build('^1.2.0')));
  // ^2.0.0 is NOT satisfied by 1.5.0
  assert.throws(() => build('^2.0.0'), /requires "ui@\^2\.0\.0" but found 1\.5\.0/);
});

test('requires: missing primitive and missing theme both throw', () => {
  assert.throws(
    () => createRegistry({ parches: [{ name: 'p', requires: { elements: ['Button'] } }] }, ROOT),
    /requires element "Button"/,
  );
  assert.throws(
    () => createRegistry({ parches: [{ name: 'p', requires: { themes: ['corporate'] } }] }, ROOT),
    /requires theme "corporate"/,
  );
});

test('requires: a provided theme value satisfies a theme requirement', () => {
  const reg = createRegistry(
    {
      parches: [
        { name: 'theme', themes: [{ label: 'Corporate', value: 'corporate' }] },
        { name: 'app', requires: { themes: ['corporate'] } },
      ],
    },
    ROOT,
  );
  assert.ok(reg.themes.some((t) => t.value === 'corporate'));
});

test('bad parche path warns (badPaths) but does not throw', () => {
  const warnings = captureWarnings(() => {
    const reg = createRegistry(
      { parches: [{ name: 'p', widgets: { Hero: '/does/not/exist/Hero.astro' } }] },
      ROOT,
    );
    assert.ok(reg);
  });
  assert.ok(
    warnings.some((w) => /path problems/i.test(w) && /Hero/.test(w) && /file not found/.test(w)),
    `expected a bad-path warning, got: ${warnings.join(' | ')}`,
  );
});

test('requires: structural widget props are recorded for the schema check', () => {
  captureWarnings(() => {
    const reg = createRegistry(
      {
        parches: [
          { name: 'ui', widgets: { Hero: '/x/Hero.astro' } },
          { name: 'app', requires: { widgets: [{ name: 'Hero', props: ['title', 'cta'] }] } },
        ],
      },
      ROOT,
    );
    assert.deepEqual(reg.widgetPropRequirements, [
      { from: 'app', name: 'Hero', props: ['title', 'cta'] },
    ]);
  });
});

// --- themes.default (server-rendered data-theme) ---

/** A theme parche contributes its CSS plus a switcher entry. */
const themeParche = (value: string, label = value) => ({
  name: `theme-${value}`,
  styles: [`/tmp/${value}.css`],
  themes: [{ label, value }],
});

test('themes.default: absent by default, so the base look renders', () => {
  const reg = createRegistry({ parches: [] }, ROOT);
  assert.equal(reg.defaultTheme, undefined);
});

test('themes.default: a value contributed by a parche is accepted', () => {
  const reg = createRegistry(
    { parches: [themeParche('astrowind', 'AstroWind')], themes: { default: 'astrowind' } } as any,
    ROOT,
  );
  assert.equal(reg.defaultTheme, 'astrowind');
  assert.ok(reg.themes.some((t) => t.value === 'astrowind'));
});

test('themes.default: an unprovided value fails fast, naming what is available', () => {
  assert.throws(
    () => createRegistry({ parches: [themeParche('minimal')], themes: { default: 'astrowind' } } as any, ROOT),
    (err: Error) => {
      assert.match(err.message, /themes\.default is "astrowind"/);
      assert.match(err.message, /minimal/);
      return true;
    },
  );
});

test('themes.default: themes.available can declare the value without a parche', () => {
  const reg = createRegistry(
    {
      parches: [],
      themes: { available: [{ label: 'AstroWind', value: 'astrowind' }], default: 'astrowind' },
    } as any,
    ROOT,
  );
  assert.equal(reg.defaultTheme, 'astrowind');
});

test('elements: a bare path is a single-part primitive, resolved with its folder and props', () => {
  const button = path.join(FIXTURES, 'Button.astro');
  const reg = createRegistry({ parches: [{ name: 'prims', elements: { Button: button } }] }, ROOT);
  assert.equal(reg.modules['parche:elements/Button'], button);
  assert.equal(reg.namedExportModules.has('parche:elements/Button'), false);
  assert.deepEqual(reg.elements.Button, {
    name: 'Button', from: 'prims', entry: button, dir: FIXTURES, parts: {}, props: undefined, style: undefined, compound: false,
  });
});

test('elements: a folder entry registers the index as named exports, each part as its own id, and finds props', () => {
  const entry = path.join(TABS_DIR, 'index.ts');
  const parts = { Root: path.join(TABS_DIR, 'Root.astro'), Panel: path.join(TABS_DIR, 'Panel.astro') };
  const reg = createRegistry({ parches: [{ name: 'prims', elements: { Tabs: { entry, parts } } }] }, ROOT);
  assert.equal(reg.modules['parche:elements/Tabs'], entry);
  assert.ok(reg.namedExportModules.has('parche:elements/Tabs'), 'compound primitive uses export *');
  assert.equal(reg.modules['parche:elements/Tabs/Panel'], parts.Panel);
  assert.equal(reg.elements.Tabs.props, path.join(TABS_DIR, 'tabs.props.ts'), 'props defaults to <dir>/<kebab>.props.ts');
  assert.equal(reg.elements.Tabs.compound, true);
});

test('elements: a style on the entry joins the styles bundle', () => {
  const entry = path.join(TABS_DIR, 'index.ts');
  const reg = createRegistry({ parches: [{ name: 'prims', elements: { Tabs: { entry, style: '/x/tabs.css' } } }] }, ROOT);
  assert.ok(reg.styleEntries.includes('/x/tabs.css'));
});

test('requires: structural part check passes when the provider exposes the parts and fails when it does not', () => {
  const entry = path.join(TABS_DIR, 'index.ts');
  const parts = { Root: path.join(TABS_DIR, 'Root.astro'), Panel: path.join(TABS_DIR, 'Panel.astro') };
  const provider = { name: 'prims', elements: { Tabs: { entry, parts } } };
  createRegistry({ parches: [provider, { name: 'ui', requires: { elements: [{ name: 'Tabs', parts: ['Root', 'Panel'] }] } }] }, ROOT);
  assert.throws(
    () => createRegistry({ parches: [provider, { name: 'ui', requires: { elements: [{ name: 'Tabs', parts: ['List'] }] } }] }, ROOT),
    /requires element "Tabs" to expose part\(s\): List/,
  );
});

test('overrides: a directory resolves to its index.ts and is recorded as overridden', () => {
  const entry = path.join(TABS_DIR, 'index.ts');
  const parts = { Root: path.join(TABS_DIR, 'Root.astro'), Panel: path.join(TABS_DIR, 'Panel.astro') };
  const reg = createRegistry(
    { parches: [{ name: 'prims', elements: { Tabs: { entry, parts } } }], overrides: { 'elements:Tabs': './ejected/tabs' } },
    FIXTURES,
  );
  const ejected = path.join(FIXTURES, 'ejected', 'tabs', 'index.ts');
  assert.equal(reg.modules['parche:elements/Tabs'], ejected);
  assert.deepEqual(reg.overridden['parche:elements/Tabs'], { original: entry, override: ejected });
  assert.ok(reg.namedExportModules.has('parche:elements/Tabs'), 'an ejected compound primitive keeps named exports');
  assert.equal(reg.elements.Tabs.from, 'override');
  assert.deepEqual(reg.elements.Tabs.parts, parts, 'the original parts are kept for the load-time export check');
});

test('overrides: a missing target is reported with attribution instead of failing later in Vite', () => {
  let reg!: ReturnType<typeof createRegistry>;
  const warnings = captureWarnings(() => {
    reg = createRegistry({ parches: [], overrides: { 'elements:Nope': './does/not/exist' } }, FIXTURES);
  });
  assert.ok(warnings.some((w) => /Override path problems/.test(w) && /"elements:Nope"/.test(w)));
  assert.equal(reg.modules['parche:elements/Nope'], path.join(FIXTURES, 'does/not/exist'));
  assert.equal(reg.overridden['parche:elements/Nope'], undefined);
});
