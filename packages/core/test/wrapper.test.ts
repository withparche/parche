import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listWrapper, nodeWrapper, outletWrappers } from '../src/content/wrapper.ts';

test('nothing is wrapped unless a list declares it', () => {
  assert.equal(listWrapper(undefined, 'Section'), null);
  assert.equal(listWrapper(false, 'Section'), null);
});

test('a declaration names its widget, or takes the registry default', () => {
  assert.deepEqual(listWrapper({ widget: 'Band', props: { tone: 'ink' } }, 'Section'), { name: 'Band', props: { tone: 'ink' } });
  assert.deepEqual(listWrapper({}, 'Section'), { name: 'Section', props: {} });
  assert.equal(listWrapper({}, null), null);
});

test('outletWrappers finds every outlet, nested ones included, with its path', () => {
  const layout = [
    { widget: 'Header' },
    { widget: 'Columns', slots: { default: [{ widget: 'Outlet', props: { wrapper: { widget: 'Section' } } }, { widget: 'Outlet', props: { name: 'aside' } }] } },
  ];
  assert.deepEqual(outletWrappers(layout), [
    { name: 'default', spec: { widget: 'Section' }, path: 'layout[1].slots.default[0]' },
    { name: 'aside', spec: undefined, path: 'layout[1].slots.default[1]' },
  ]);
});

test("a node's own wrapper: its props over the list's, another widget alone, or none", () => {
  const list = { name: 'Section', props: { spacing: 'md', tone: 'default' } };
  // Absent: the list's, as it is.
  assert.equal(nodeWrapper(undefined, list, 'Section'), list);
  // Props only: the list's widget, its props as defaults.
  assert.deepEqual(nodeWrapper({ props: { id: 'faq', tone: 'muted' } }, list, 'Section'), { name: 'Section', props: { spacing: 'md', tone: 'muted', id: 'faq' } });
  // Another widget: only its own props.
  assert.deepEqual(nodeWrapper({ widget: 'Band', props: { angle: 3 } }, list, 'Section'), { name: 'Band', props: { angle: 3 } });
  // false: bare.
  assert.equal(nodeWrapper(false, list, 'Section'), null);
  // In a list with no wrapper (a slot), props alone take the registry default.
  assert.deepEqual(nodeWrapper({ props: { id: 'x' } }, null, 'Section'), { name: 'Section', props: { id: 'x' } });
  assert.equal(nodeWrapper({ props: { id: 'x' } }, null, null), null);
});
