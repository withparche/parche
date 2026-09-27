import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ZodType } from 'zod';
import { createResolver, substituteRefs, pageSchema, layoutSchema, patternSchema, definePattern, patternsFor, type Pattern, type Node } from '@parche/astro/content/pure';
import createUI from '../../../parches/ui/src/index.ts';
import { validateDoc, type ValidationContext } from '../src/server/validate.ts';

const REPO = fileURLToPath(new URL('../../../', import.meta.url));
const DEMO = join(REPO, 'demos/astrowind/src/content');

const walk = (dir: string, ext: RegExp, acc: string[] = []) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, ext, acc);
    else if (ext.test(name)) acc.push(full);
  }
  return acc;
};
const json = (file: string) => JSON.parse(readFileSync(file, 'utf8'));

/** The catalog as the site's virtual modules carry it, read straight from the ui parche. */
async function catalog(): Promise<Omit<ValidationContext, 'collectionSchema'>> {
  const widgetsDir = join(REPO, 'parches/ui/src/widgets');
  const widgetMeta: ValidationContext['widgetMeta'] = {};
  const widgetPropSchemas: Record<string, ZodType> = {};
  const layoutDir = join(REPO, 'parches/ui/src/layout');
  const files = [...walk(widgetsDir, /\.props\.ts$/).map((f) => [f, relative(widgetsDir, f)]), ...walk(layoutDir, /\.props\.ts$/).map((f) => [f, relative(layoutDir, f)])];
  for (const [file, rel] of files) {
    const key = rel.replace(/\.props\.ts$/, '');
    const m = await import(file);
    widgetMeta[key] = { slots: m.meta?.slots ?? {}, wrapper: m.meta?.widget?.wrapper !== false };
    if (m.schema) widgetPropSchemas[key] = m.schema;
  }
  const manifest = createUI() as { tones?: { name: string }[] };
  const tones = ['default', 'muted', 'dark', 'primary', ...(manifest.tones ?? []).map((t) => t.name)];
  const patterns: Pattern[] = [];
  for (const file of walk(join(DEMO, 'patterns'), /\.json$/)) {
    const { pattern } = definePattern(relative(join(DEMO, 'patterns'), file).replace(/\.json$/, ''), json(file));
    if (pattern) patterns.push(pattern);
  }
  const definitions = Object.fromEntries(Object.entries(patternsFor(patterns, 'en')).map(([name, p]) => [name, { ...p, name }]));
  // References resolve against the demo's collections (its menus, its products), as a page's do.
  const collection = (c: string) => {
    const dir = join(DEMO, c);
    try {
      return walk(dir, /\.json$/).map((f) => ({ id: relative(dir, f).replace(/\.json$/, ''), data: json(f) }));
    } catch {
      return undefined;
    }
  };
  const resolve = createResolver(collection, 'en');
  return {
    widgetMeta,
    widgetPropSchemas,
    tones,
    wrapper: 'Section',
    definitions,
    resolveRefs: async (nodes: Node[], base: string) => substituteRefs(nodes, resolve, base),
    definePattern,
  };
}

test('the whole demo validates clean: no false positives before a single edit', async () => {
  const ctx = await catalog();
  const found: string[] = [];
  const check = async (collection: string, schema: ZodType | undefined) => {
    const dir = join(DEMO, collection);
    for (const file of walk(dir, /\.json$/)) {
      const id = relative(dir, file).replace(/\.json$/, '');
      for (const i of await validateDoc(collection, json(file), { ...ctx, collectionSchema: schema }, id)) found.push(`${collection}/${id} ${i.path}: ${i.message}`);
    }
  };
  await check('pages', pageSchema);
  await check('layouts', layoutSchema);
  await check('patterns', patternSchema);
  assert.deepEqual(found, []);
});

test('props are checked the way the widget parses them, refinements included', async () => {
  const ctx = await catalog();
  const page = { title: 'P', sections: [{ widget: 'Pricing', props: { items: [{ title: 'Team', price: { weekly: '9' } }] } }] };
  const issues = await validateDoc('pages', page, { ...ctx, collectionSchema: pageSchema });
  assert.deepEqual(issues.map((i) => [i.source, i.path]), [['props', 'sections[0].props.items[0].price']]);
  assert.match(issues[0].message, /declares no periods/);
});

test('tree, reference and schema issues each come with their path', async () => {
  const ctx = await catalog();
  const page = {
    sections: [
      { widget: 'Nope' },
      { widget: 'Hero', slots: { media: [{ widget: 'Hero' }, { widget: 'Hero' }, { widget: 'Hero' }, { widget: 'Hero' }] } },
      { widget: 'Header', props: { links: { $ref: 'navigation/en/missing' } } },
    ],
  };
  const issues = await validateDoc('pages', page, { ...ctx, collectionSchema: pageSchema });
  const byPath = (p: string) => issues.filter((i) => i.path === p).map((i) => i.source);
  assert.ok(byPath('title').includes('schema'), 'a page needs a title');
  assert.ok(byPath('sections[0]').includes('tree'), 'unknown widget');
  assert.ok(byPath('sections[1].slots.media').includes('tree'), 'media takes at most 3');
  assert.ok(issues.some((i) => i.source === 'ref' && i.path.startsWith('sections[2]')), 'a reference to nothing');
});
