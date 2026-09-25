import { test } from 'node:test';
import assert from 'node:assert/strict';
import { substituteNavigation, hasNavigationRef } from '../src/content/navigation.ts';

const menus: Record<string, unknown[]> = { main: [{ label: 'Docs', href: '/docs' }], social: [{ label: 'GitHub', href: 'https://github.com' }] };
const find = (name: string) => menus[name];

test('a reference in props becomes the menu items, in roots and in slots', () => {
  const nodes = [
    { widget: 'Header', props: { links: { $navigation: 'main' }, actions: [] } },
    { widget: 'Section', slots: { default: [{ widget: 'Footer', props: { socialLinks: { $navigation: 'social' } } }] } },
  ];
  assert.equal(hasNavigationRef(nodes), true);
  const { nodes: out, missing } = substituteNavigation(nodes, find, 'layout');
  assert.deepEqual(out[0].props?.links, menus.main);
  assert.deepEqual(out[1].slots?.default[0].props?.socialLinks, menus.social);
  assert.deepEqual(missing, []);
});

test('an unknown menu becomes an empty list and is reported with its path', () => {
  const { nodes, missing } = substituteNavigation([{ widget: 'Header', props: { links: { $navigation: 'nope' } } }], find);
  assert.deepEqual(nodes[0].props?.links, []);
  assert.deepEqual(missing, [{ path: 'sections[0].props.links', name: 'nope' }]);
});

test('an object with other keys beside $navigation is data, not a reference', () => {
  const props = { links: { $navigation: 'main', extra: true } };
  assert.equal(hasNavigationRef(props), false);
  const { nodes } = substituteNavigation([{ widget: 'Header', props }], find);
  assert.deepEqual(nodes[0].props, props);
});
