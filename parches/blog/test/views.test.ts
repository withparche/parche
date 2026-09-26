/**
 * The views each preset ships: every preset has one per page type, every
 * widget they name is registered by the ui parche, and every `$label` is a
 * blog label (so a view never carries English of its own).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_LABELS } from '../src/labels.ts';
import { BLOG_PRESETS } from '../src/types.ts';

const here = dirname(fileURLToPath(import.meta.url));
const VIEWS = join(here, '../src/views');
const uiIndex = readFileSync(join(here, '../../ui/src/index.ts'), 'utf8');
const registered = new Set([...uiIndex.matchAll(/^\s+'?([\w/]+)'?: w\(/gm)].map((m) => m[1]));

const walk = (nodes: any[], out: any[] = []) => {
  for (const n of nodes) {
    out.push(n);
    for (const kids of Object.values(n.slots ?? {})) walk(kids as any[], out);
  }
  return out;
};
const labelsIn = (v: unknown, out: string[] = []): string[] => {
  if (Array.isArray(v)) v.forEach((x) => labelsIn(x, out));
  else if (v && typeof v === 'object') {
    if (typeof (v as any).$label === 'string') out.push((v as any).$label);
    else Object.values(v).forEach((x) => labelsIn(x, out));
  }
  return out;
};

test('every preset ships the same views', () => {
  const presets = readdirSync(VIEWS).filter((f) => !f.includes('.')).sort();
  assert.deepEqual(presets, Object.keys(BLOG_PRESETS).sort());
  for (const p of presets) assert.deepEqual(readdirSync(join(VIEWS, p)).sort(), ['author.json', 'index.json', 'taxonomy.json'], p);
});

for (const preset of Object.keys(BLOG_PRESETS)) {
  test(`${preset}: views name registered widgets and real labels`, () => {
    for (const file of readdirSync(join(VIEWS, preset))) {
      const view = JSON.parse(readFileSync(join(VIEWS, preset, file), 'utf8'));
      for (const node of walk(view.sections)) assert.ok(registered.has(node.widget), `${preset}/${file}: "${node.widget}" is not a ui widget`);
      for (const key of labelsIn(view)) assert.ok(key in DEFAULT_LABELS, `${preset}/${file}: no label "${key}"`);
    }
  });
}
