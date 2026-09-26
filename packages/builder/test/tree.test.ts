import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyPatches, enablePatches, produceWithPatches } from 'immer';
import { assignIds, stripIds } from '../src/editor/tree/ids.ts';
import { locate, nodeAtPath } from '../src/editor/tree/locate.ts';
import { duplicateNode, insertNode, moveNode, removeNode, setProp, setWrapper } from '../src/editor/tree/ops.ts';
import { canPlace, type RulesCatalog } from '../src/editor/tree/rules.ts';
import { kindOf } from '../src/shared/roots.ts';

enablePatches();
const DEMO = fileURLToPath(new URL('../../../demos/astrowind/src/content/', import.meta.url));
const walk = (dir: string, acc: string[] = []) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (name.endsWith('.json')) acc.push(full);
  }
  return acc;
};

test('ids come and go without a trace: every demo document round-trips to the same JSON', () => {
  let files = 0;
  for (const collection of ['pages', 'layouts', 'presets', 'widgets', 'views']) {
    let list: string[] = [];
    try {
      list = walk(join(DEMO, collection));
    } catch {}
    for (const file of list) {
      const text = readFileSync(file, 'utf8');
      const kind = kindOf(collection);
      const data = JSON.parse(text);
      const { ephemeral } = assignIds(kind, data);
      assert.equal(JSON.stringify(stripIds(kind, data, ephemeral)), JSON.stringify(JSON.parse(text)), file);
      files++;
    }
  }
  assert.ok(files > 30, `${files} files`);
});

test('an id written in the file is kept; a repeated one is replaced and reported', () => {
  const data = { sections: [{ widget: 'A', id: 'hero' }, { widget: 'B', id: 'hero' }, { widget: 'C' }] };
  const { ephemeral, repeated } = assignIds('page', data);
  assert.equal(data.sections[0].id, 'hero');
  assert.notEqual(data.sections[1].id, 'hero');
  assert.deepEqual(repeated, ['hero']);
  assert.equal(ephemeral.size, 2);
  assert.deepEqual(stripIds('page', data, ephemeral), { sections: [{ widget: 'A', id: 'hero' }, { widget: 'B' }, { widget: 'C' }] });
});

const page = () => {
  const data: any = {
    title: 'P',
    sections: [
      { widget: 'Hero', props: { title: 'Hi' }, slots: { media: [{ widget: 'Image' }] } },
      { widget: 'Columns', slots: { default: [{ widget: 'Column' }, { widget: 'Column' }] } },
      { widget: 'Features' },
    ],
  };
  assignIds('page', data);
  return data;
};
const id = (data: any, path: string) => nodeAtPath('page', data, path)!;

test('insert, move across slots, duplicate and remove; emptied slots disappear', () => {
  const data = page();
  const hero = id(data, 'sections[0]');
  const image = id(data, 'sections[0].slots.media[0]');
  moveNode('page', data, image, { root: 'sections', index: 3 });
  assert.equal(data.sections[3].widget, 'Image');
  assert.equal(data.sections[0].slots, undefined, 'the empty media slot and slots object are gone');
  moveNode('page', data, data.sections[3].id, { parent: hero, slot: 'proof', index: 0 });
  assert.equal(data.sections[0].slots.proof[0].widget, 'Image');
  const copy = duplicateNode('page', data, id(data, 'sections[2]'))!;
  assert.equal(locate('page', data, copy)!.index, 3);
  assert.notEqual(copy, id(data, 'sections[2]'));
  removeNode('page', data, copy);
  insertNode('page', data, { root: 'slots.aside', index: 0 }, { widget: 'TOC', id: 'x' });
  assert.equal(data.slots.aside[0].widget, 'TOC');
  // Moving down within a list lands where it was dropped.
  moveNode('page', data, id(data, 'sections[0]'), { root: 'sections', index: 2 });
  assert.deepEqual(data.sections.map((n: any) => n.widget), ['Columns', 'Hero', 'Features']);
});

test('props and wrapper edits; undefined removes, and emptied objects go with it', () => {
  const data = page();
  const hero = id(data, 'sections[0]');
  setProp('page', data, hero, ['image', 'src'], 'x.png');
  setProp('page', data, hero, ['actions', 0, 'text'], 'Go');
  assert.deepEqual(data.sections[0].props, { title: 'Hi', image: { src: 'x.png' }, actions: [{ text: 'Go' }] });
  setProp('page', data, hero, ['image', 'src'], undefined);
  assert.equal(data.sections[0].props.image, undefined);
  setWrapper('page', data, hero, { props: { tone: 'muted' } });
  assert.deepEqual(data.sections[0].wrapper, { props: { tone: 'muted' } });
  setWrapper('page', data, hero, undefined);
  assert.equal('wrapper' in data.sections[0], false);
});

test('every edit undoes and redoes exactly, through immer patches', () => {
  const base: Record<string, any> = page();
  const hero = id(base, 'sections[0]');
  const [next, patches, inverse] = produceWithPatches(base, (d: Record<string, any>) => {
    moveNode('page', d, id(d, 'sections[0].slots.media[0]'), { root: 'sections', index: 0 });
    setProp('page', d, hero, ['title'], 'Changed');
  });
  assert.deepEqual(applyPatches(next, inverse), base);
  assert.deepEqual(applyPatches(base, patches), next);
});

const catalog: RulesCatalog = {
  widgets: {
    Hero: { slots: { media: { allow: ['Image', 'Form'], max: 1 }, proof: { max: 2 } } },
    Columns: { slots: { default: { allow: ['Column'], min: 2, max: 4 } } },
    Column: { slots: { default: {} }, hidden: true },
    Section: { slots: { default: {} } },
    Switch: { slots: { '*': {} } },
    Image: {},
    Features: {},
  },
};

test('the rules offer only places that will render', () => {
  const data = page();
  const hero = id(data, 'sections[0]');
  const columns = id(data, 'sections[1]');
  const column = id(data, 'sections[1].slots.default[0]');
  assert.deepEqual(canPlace(catalog, 'page', data, { parent: hero, slot: 'media', index: 0 }, { widget: 'Features' }), { ok: false, reason: 'Hero.media takes Image, Form' });
  assert.equal(canPlace(catalog, 'page', data, { parent: hero, slot: 'media', index: 1 }, { widget: 'Image' }).ok, false, 'media takes at most 1');
  assert.equal(canPlace(catalog, 'page', data, { parent: hero, slot: 'media', index: 0 }, { widget: 'Image' }, id(data, 'sections[0].slots.media[0]')).ok, true, 'moving within the slot does not count itself');
  assert.equal(canPlace(catalog, 'page', data, { parent: hero, slot: 'nope', index: 0 }, { widget: 'Image' }).ok, false);
  assert.equal(canPlace(catalog, 'page', data, { parent: columns, slot: 'default', index: 0 }, { widget: 'Column' }).ok, true);
  // Column sits at depth 1, so its slot is depth 2: a Section there fits with one level below it, not two.
  assert.equal(canPlace(catalog, 'page', data, { parent: column, slot: 'default', index: 0 }, { widget: 'Section', slots: { default: [{ widget: 'Features' }] } }).ok, true);
  const deep = { widget: 'Section', slots: { default: [{ widget: 'Section', slots: { default: [{ widget: 'Features' }] } }] } };
  assert.match((canPlace(catalog, 'page', data, { parent: column, slot: 'default', index: 0 }, deep) as { reason: string }).reason, /too deep/);
  assert.match((canPlace(catalog, 'page', data, { parent: column, slot: 'default', index: 0 }, { widget: 'Columns' }, columns) as { reason: string }).reason, /into itself/);
  assert.equal(canPlace(catalog, 'page', data, { root: 'sections', index: 0 }, { widget: 'Outlet' }).ok, false);
  assert.equal(canPlace(catalog, 'layout', data, { root: 'sections', index: 0 }, { widget: 'Outlet' }).ok, true);
  // A wildcard slot takes any name.
  const sw: any = { sections: [{ widget: 'Switch', id: 's' }] };
  assert.equal(canPlace(catalog, 'page', sw, { parent: 's', slot: 'monthly', index: 0 }, { widget: 'Features' }).ok, true);
});
