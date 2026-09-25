import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listWrapper, outletWrappers } from '../src/content/wrapper.ts';

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
