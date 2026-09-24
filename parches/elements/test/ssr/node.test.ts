/**
 * The node renderer, rendered with plain fixture components: slots from data
 * land in the widget's named slots, roots are wrapped, outlets place page
 * content, and the fallback content survives an unfilled slot.
 */
import { test, expect } from 'vitest';
import { render } from './_render';
import Node from '../../../../packages/core/src/components/Node.astro';
import Host from './_fixtures/Host.astro';
import Leaf from './_fixtures/Leaf.astro';
import Wrap from './_fixtures/Wrap.astro';

const widgets = { Host, Leaf, Wrap };
const wrapper = { name: 'Wrap', component: Wrap };

test('slots from data fill the widget\'s named and default slots, recursively', async () => {
  const html = await render(Node, {
    node: {
      widget: 'Host',
      props: { title: 'T' },
      slots: {
        media: [{ widget: 'Leaf', props: { text: 'in media' } }],
        default: [{ widget: 'Leaf', props: { text: 'in default' } }, { widget: 'Host', props: { title: 'nested' } }],
      },
    },
    widgets,
    wrapper,
  });
  expect(html).toContain('<div data-media><p data-leaf>in media</p></div>');
  expect(html).toContain('in default');
  expect(html).toContain('<h2>nested</h2>');
  // The nested Host fills no slot, so its own fallback shows; the outer one is filled.
  expect(html.match(/FALLBACK/g)?.length).toBe(1);
});

test('a root is wrapped once, a nested node never, and the wrapper itself is not wrapped', async () => {
  const root = await render(Node, { node: { widget: 'Leaf', props: { text: 'x' } }, widgets, wrapper, wrap: true });
  expect(root).toMatch(/^<div data-wrap><p data-leaf>x<\/p><\/div>$/);
  const nested = await render(Node, {
    node: { widget: 'Host', slots: { default: [{ widget: 'Leaf', props: { text: 'y' } }] } },
    widgets,
    wrapper,
    wrap: true,
  });
  expect(nested.match(/data-wrap/g)?.length).toBe(1);
  const explicit = await render(Node, { node: { widget: 'Wrap', slots: { default: [{ widget: 'Leaf', props: { text: 'z' } }] } }, widgets, wrapper, wrap: true });
  expect(explicit.match(/data-wrap/g)?.length).toBe(1);
  const bare = await render(Node, { node: { widget: 'Leaf', props: { text: 'x' } }, widgets, wrapper: null, wrap: true });
  expect(bare).toBe('<p data-leaf>x</p>');
  const fullBleed = await render(Node, { node: { widget: 'Leaf', props: { text: 'x' } }, widgets, wrapper, unwrapped: ['Leaf'], wrap: true });
  expect(fullBleed).toBe('<p data-leaf>x</p>');
});

test('an Outlet places the page trees (wrapped) and the pre-rendered content by name', async () => {
  const outlets = {
    nodes: { default: [{ widget: 'Leaf', props: { text: 'page' } }], aside: [{ widget: 'Leaf', props: { text: 'side' } }] },
    html: { default: '<p data-md>body</p>' },
  };
  const main = await render(Node, { node: { widget: 'Outlet' }, widgets, wrapper, outlets });
  expect(main).toContain('<main id="main-content" class="flex-1"><div data-wrap><p data-leaf>page</p></div><p data-md>body</p></main>');
  const aside = await render(Node, { node: { widget: 'Outlet', props: { name: 'aside' } }, widgets, wrapper, outlets });
  expect(aside).toBe('<div data-wrap><p data-leaf>side</p></div>');
  const inLayout = await render(Node, {
    node: { widget: 'Host', props: { title: 'shell' }, slots: { default: [{ widget: 'Outlet' }] } },
    widgets,
    wrapper,
    outlets,
  });
  expect(inLayout).toContain('<div data-default><main id="main-content"');
});

test('an unknown widget renders a dev placeholder, and an empty slot list keeps the fallback', async () => {
  const html = await render(Node, { node: { widget: 'Nope' }, widgets, wrapper });
  expect(html).toContain('data-parche-missing-widget="Nope"');
  const empty = await render(Node, { node: { widget: 'Host', slots: { media: [] } }, widgets, wrapper });
  expect(empty).toContain('FALLBACK');
});
