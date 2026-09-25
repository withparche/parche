/**
 * The node renderer, rendered with plain fixture components: slots from data
 * land in the widget's named slots, only the items of a list that declares a
 * wrapper are wrapped, outlets place page content, and the fallback content
 * survives an unfilled slot.
 */
import { test, expect } from 'vitest';
import { render } from './_render';
import Node from '../../../../packages/core/src/components/Node.astro';
import Host from './_fixtures/Host.astro';
import Leaf from './_fixtures/Leaf.astro';
import Wrap from './_fixtures/Wrap.astro';

const widgets = { Host, Leaf, Wrap };
// A list's wrapper, as an Outlet or a page declares it and the renderer resolves it.
const wrapper = { name: 'Wrap', props: { tone: 'surface' } };

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
  });
  expect(html).toContain('<div data-media><p data-leaf>in media</p></div>');
  expect(html).toContain('in default');
  expect(html).toContain('<h2>nested</h2>');
  // The nested Host fills no slot, so its own fallback shows; the outer one is filled.
  expect(html.match(/FALLBACK/g)?.length).toBe(1);
});

test('an item of a wrapped list is wrapped once, with the list props; a nested node never', async () => {
  const item = await render(Node, { node: { widget: 'Leaf', props: { text: 'x' } }, widgets, wrapper });
  expect(item).toMatch(/^<div data-wrap data-tone="surface"><p data-leaf>x<\/p><\/div>$/);
  const nested = await render(Node, { node: { widget: 'Host', slots: { default: [{ widget: 'Leaf', props: { text: 'y' } }] } }, widgets, wrapper });
  expect(nested.match(/data-wrap/g)?.length).toBe(1);
  const bare = await render(Node, { node: { widget: 'Leaf', props: { text: 'x' } }, widgets });
  expect(bare).toBe('<p data-leaf>x</p>');
  const fullBleed = await render(Node, { node: { widget: 'Leaf', props: { text: 'x' } }, widgets, wrapper, unwrapped: ['Leaf'] });
  expect(fullBleed).toBe('<p data-leaf>x</p>');
});

test('the wrapper written as an item is not wrapped again and takes the list props as defaults', async () => {
  const explicit = await render(Node, { node: { widget: 'Wrap', props: { id: 'pricing' }, slots: { default: [{ widget: 'Leaf', props: { text: 'z' } }] } }, widgets, wrapper });
  expect(explicit.match(/data-wrap/g)?.length).toBe(1);
  expect(explicit).toContain('id="pricing"');
  expect(explicit).toContain('data-tone="surface"');
  const own = await render(Node, { node: { widget: 'Wrap', props: { tone: 'ink' }, slots: { default: [{ widget: 'Leaf', props: { text: 'z' } }] } }, widgets, wrapper });
  expect(own).toContain('data-tone="ink"');
});

test('an Outlet wraps its items only when it, or the page, declares a wrapper', async () => {
  const outlets = {
    nodes: { default: [{ widget: 'Leaf', props: { text: 'page' } }], aside: [{ widget: 'Leaf', props: { text: 'side' } }] },
    html: { default: '<p data-md>body</p>' },
  };
  const declared = { widget: 'Outlet', props: { wrapper: { widget: 'Wrap' } } };
  const main = await render(Node, { node: declared, widgets, outlets });
  expect(main).toContain('<main id="main-content" class="flex-1"><div data-wrap><p data-leaf>page</p></div><p data-md>body</p></main>');
  const plain = await render(Node, { node: { widget: 'Outlet' }, widgets, outlets });
  expect(plain).toContain('<main id="main-content" class="flex-1"><p data-leaf>page</p><p data-md>body</p></main>');
  const byDefault = await render(Node, { node: { widget: 'Outlet', props: { wrapper: {} } }, widgets, defaultWrapper: 'Wrap', outlets });
  expect(byDefault).toContain('<div data-wrap><p data-leaf>page</p></div>');
  const pageOff = await render(Node, { node: declared, widgets, outlets: { ...outlets, wrappers: { default: false } } });
  expect(pageOff).not.toContain('data-wrap');
  const aside = await render(Node, { node: { widget: 'Outlet', props: { name: 'aside', wrapper: { widget: 'Wrap' } } }, widgets, outlets });
  expect(aside).toBe('<div data-wrap><p data-leaf>side</p></div>');
  const inLayout = await render(Node, {
    node: { widget: 'Host', props: { title: 'shell' }, slots: { default: [declared] } },
    widgets,
    outlets,
  });
  expect(inLayout).toContain('<div data-default><main id="main-content"');
  expect(inLayout.match(/data-wrap/g)?.length).toBe(1);
});

test('an unknown widget renders a dev placeholder, and an empty slot list keeps the fallback', async () => {
  const html = await render(Node, { node: { widget: 'Nope' }, widgets });
  expect(html).toContain('data-parche-missing-widget="Nope"');
  const empty = await render(Node, { node: { widget: 'Host', slots: { media: [] } }, widgets });
  expect(empty).toContain('FALLBACK');
});
