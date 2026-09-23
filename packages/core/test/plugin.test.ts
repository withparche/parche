import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { vitePluginParche } from '../src/integration/vite-plugin-parche.ts';
import type { ResolvedRegistry } from '../src/integration/types.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GOOD_ASTRO = path.join(HERE, 'fixtures', 'Good.astro'); // sibling Good.props.ts exists
const TABS_DIR = path.join(HERE, 'fixtures', 'tabs');
const EJECTED_TABS = path.join(HERE, 'fixtures', 'ejected', 'tabs', 'index.ts');

/** Minimal ResolvedRegistry with only the fields a given generator reads. */
function makeRegistry(partial: Partial<ResolvedRegistry>): ResolvedRegistry {
  return {
    modules: {},
    namedExportModules: new Set(),
    fullBleedWidgets: [],
    widgetPropRequirements: [],
    elements: {},
    overridden: {},
    i18n: { locales: ['en'], defaultLocale: 'en' },
    themes: [],
    showPanel: false,
    styleEntries: [],
    contentGlobs: [],
    apps: [],
    resolvers: [],
    ...partial,
  };
}

/** Call the plugin's `load` hook for a virtual id with a no-op Rollup context. */
function load(registry: ResolvedRegistry, id: string): string {
  const plugin = vitePluginParche(registry);
  const ctx = { addWatchFile() {}, error(msg: string) { throw new Error(msg); } };
  return (plugin.load as any).call(ctx, id) as string;
}

test('widget map is generated lazily (widgetLoaders + loadWidgets, no static imports)', () => {
  const code = load(
    makeRegistry({
      modules: {
        'parche:widgets/Hero': '/x/Hero.astro',
        'parche:elements/Button': '/x/Button.astro',
      },
    }),
    '\0parche:registry/widgets',
  );
  assert.match(code, /export const widgetLoaders =/);
  assert.match(code, /export async function loadWidgets/);
  assert.match(code, /"Hero": \(\) => import\("parche:widgets\/Hero"\)/);
  // Elements are not widgets: they have their own catalog and a compound
  // element's parts would collide on a short key here.
  assert.doesNotMatch(code, /parche:elements\/Button/);
  // The whole point: no eager static widget imports.
  assert.doesNotMatch(code, /^import \w+ from ["']parche:widgets\//m);
});

test('layout config emits the fullBleed widget list', () => {
  const code = load(makeRegistry({ fullBleedWidgets: ['Hero', 'Note'] }), '\0parche:config/layout');
  assert.match(code, /export const fullBleedWidgets = \["Hero","Note"\]/);
});

test('widget schemas: has-props widget emits guarded toJSONSchema + meta', () => {
  const code = load(
    makeRegistry({ modules: { 'parche:widgets/Good': GOOD_ASTRO } }),
    '\0parche:registry/widgetSchemas',
  );
  assert.match(code, /widgetSchemas\["Good"\] = z\.toJSONSchema/);
  assert.match(code, /try \{/, 'per-widget schema serialization is wrapped in try/catch');
  assert.match(code, /widgetMeta\["Good"\]/);
});

test('widget schemas: layout/* widgets are skipped (structural, not palette)', () => {
  const code = load(
    makeRegistry({ modules: { 'parche:widgets/layout/Header': '/x/layout/Header.astro' } }),
    '\0parche:registry/widgetSchemas',
  );
  assert.doesNotMatch(code, /layout\/Header/);
});

test('widget schemas: structural prop requirements emit a warning check', () => {
  const code = load(
    makeRegistry({
      modules: { 'parche:widgets/Good': GOOD_ASTRO },
      widgetPropRequirements: [{ from: 'app', name: 'Good', props: ['title', 'cta'] }],
    }),
    '\0parche:registry/widgetSchemas',
  );
  assert.match(code, /console\.warn/);
  assert.match(code, /\["title","cta"\]/);
  assert.match(code, /Good/);
});

test('resolvers: empty registry yields stub functions', () => {
  const code = load(makeRegistry({ resolvers: [] }), '\0parche:registry/resolvers');
  assert.match(code, /export async function resolveContent\(\) \{ return null; \}/);
  assert.match(code, /export async function getResolverPaths\(\) \{ return \[\]; \}/);
});

test('resolvers: registered resolvers are imported and aggregated', () => {
  const code = load(
    makeRegistry({ resolvers: [{ appName: 'blog', entrypoint: '/x/blog/resolver.ts' }] }),
    '\0parche:registry/resolvers',
  );
  assert.match(code, /import \{ resolve as resolve_0, getPaths as getPaths_0 \} from "\/x\/blog\/resolver\.ts"/);
  assert.match(code, /const resolvers = \[\{ resolve: resolve_0, getPaths: getPaths_0 \}\]/);
});

test('elements catalog: props file emits guarded root + part schemas, meta and index', () => {
  const code = load(
    makeRegistry({
      elements: {
        Tabs: {
          name: 'Tabs', from: 'primitives', entry: path.join(TABS_DIR, 'index.ts'), dir: TABS_DIR,
          parts: { Root: path.join(TABS_DIR, 'Root.astro'), Panel: path.join(TABS_DIR, 'Panel.astro') },
          props: path.join(TABS_DIR, 'tabs.props.ts'), compound: true,
        },
      },
    }),
    '\0parche:registry/elements',
  );
  assert.match(code, /export const elementSchemas = \{\};/);
  assert.match(code, /elementSchemas\["Tabs"\] = \{ root: z\.toJSONSchema\(p0\.schema\), parts: \{\} \}/);
  assert.match(code, /elementSchemas\["Tabs"\]\.parts\[part\] = z\.toJSONSchema\(def\.schema\)/);
  assert.match(code, /elementMeta\["Tabs"\] = \{ \.\.\.p0\.meta\.element/);
  assert.match(code, /__e\.interactive = !!p0\.meta\.element\.tag/);
  assert.match(code, /name: "Tabs", parts: \["Root","Panel"\], interactive: false, from: "primitives"/);
  assert.match(code, /try \{/, 'serialization is guarded');
});

test('elements catalog: a primitive without props still lands in the index', () => {
  const code = load(
    makeRegistry({
      elements: { Button: { name: 'Button', from: 'primitives', entry: '/x/Button.astro', dir: '/x', parts: {}, compound: false } },
    }),
    '\0parche:registry/elements',
  );
  assert.match(code, /name: "Button", parts: \[\], interactive: false/);
  assert.doesNotMatch(code, /elementSchemas\["Button"\]/);
});

test('elements catalog: an overridden compound primitive is checked for the original parts', () => {
  const code = load(
    makeRegistry({
      elements: {
        Tabs: { name: 'Tabs', from: 'override', entry: EJECTED_TABS, dir: path.dirname(EJECTED_TABS),
          parts: { Root: '/orig/Root.astro', Panel: '/orig/Panel.astro' }, compound: true },
      },
      overridden: { 'parche:elements/Tabs': { original: '/orig/index.ts', override: EJECTED_TABS } },
    }),
    '\0parche:registry/elements',
  );
  assert.ok(code.includes(`import * as o0 from ${JSON.stringify(EJECTED_TABS)}`));
  assert.match(code, /for \(const __p of \["Root","Panel"\]\) \{ if \(!\(__p in o0\)\)/);
  assert.match(code, /override \\"elements:Tabs\\" is missing export/);
});
