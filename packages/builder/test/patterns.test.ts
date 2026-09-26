import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Node } from '@parche/astro/content/pure';
import { detach, linkProp, patternFrom, propNameFor, removeProp, renameProp, setRequired, unlinkProp } from '../src/editor/tree/pattern-ops.ts';
import { assignIds, newId, stripIds } from '../src/editor/tree/ids.ts';
import { insertNode } from '../src/editor/tree/ops.ts';

const faq = () => ({
  label: 'Common questions',
  tree: [{ widget: 'FAQs', props: { title: 'Questions', items: [{ title: 'Is it free?', description: 'Yes.' }] } }] as Node[],
});
const titleSchema = { type: 'string', description: 'The heading.' };

test('a pattern made from a node holds a copy without editor ids', () => {
  const node: Node = { widget: 'Section', id: 'n_a1', slots: { default: [{ widget: 'Features', id: 'n_b2' }] } };
  assert.deepEqual(patternFrom([node], 'Band'), { label: 'Band', tree: [{ widget: 'Section', slots: { default: [{ widget: 'Features' }] } }] });
});

test("linking a field declares the prop with the field's schema and its value as the default", () => {
  const p: any = faq();
  linkProp(p, p.tree[0], ['title'], 'title', titleSchema);
  assert.deepEqual(p.tree[0].props.title, { $prop: 'title' });
  assert.deepEqual(p.props, { type: 'object', properties: { title: { type: 'string', description: 'The heading.', default: 'Questions' } } });
  // A second field linked to the same prop only places it.
  linkProp(p, p.tree[0], ['items', 0, 'title'], 'title', { type: 'string' });
  assert.deepEqual(Object.keys(p.props.properties), ['title']);
  assert.equal(propNameFor(['items', 0, 'title']), 'title');
});

test('unlinking gives the field its default back; the last one takes the declaration with it', () => {
  const p: any = faq();
  linkProp(p, p.tree[0], ['title'], 'title', titleSchema);
  setRequired(p, 'title', true);
  unlinkProp(p, p.tree[0], ['title']);
  assert.equal(p.tree[0].props.title, 'Questions');
  assert.equal(p.props, undefined);
});

test('renaming a prop renames its placeholders, dotted ones included; removing it unlinks them', () => {
  const p: any = { label: 'Card', props: { type: 'object', properties: { link: { type: 'object' } }, required: ['link'] }, tree: [{ widget: 'Callout', props: { href: { $prop: 'link.href' }, actions: [{ $prop: 'link' }] } }] };
  renameProp(p, 'link', 'action');
  assert.deepEqual(p.props, { type: 'object', properties: { action: { type: 'object' } }, required: ['action'] });
  assert.deepEqual(p.tree[0].props, { href: { $prop: 'action.href' }, actions: [{ $prop: 'action' }] });
  removeProp(p, 'action');
  assert.equal(p.props, undefined);
  assert.deepEqual(p.tree[0].props, { actions: [] });
});

test("detaching a use gives the pattern's widgets with the use's values and the defaults", () => {
  const p: any = faq();
  linkProp(p, p.tree[0], ['title'], 'title', titleSchema);
  const pattern = { label: p.label, schema: p.props, tree: p.tree };
  assert.equal(detach(pattern, { title: 'Dudas' })[0].props!.title, 'Dudas');
  assert.equal(detach(pattern, undefined)[0].props!.title, 'Questions');
});

test('a node the editor inserted is saved without its id, like the ones it gave on opening', () => {
  const data: any = { sections: [{ widget: 'Hero' }] };
  const { ephemeral } = assignIds('page', data);
  insertNode('page', data, { root: 'sections', index: 1 }, { widget: 'Features', id: newId() });
  assert.deepEqual(stripIds('page', data, ephemeral), { sections: [{ widget: 'Hero' }, { widget: 'Features' }] });
});
