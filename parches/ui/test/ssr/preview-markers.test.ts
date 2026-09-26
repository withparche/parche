/**
 * A development tool's preview (the builder) marks each node's output with
 * comments naming its id — only inside the preview context it opens, never
 * in a normal render or a build.
 */
import { test, expect } from 'vitest';
import { AsyncLocalStorage } from 'node:async_hooks';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Node from '../../../../packages/core/src/components/Node.astro';
import Section from '../../src/widgets/Section.astro';
import Column from '../../src/widgets/Column.astro';

const als = new AsyncLocalStorage<{ drafts: Map<string, unknown>; markers: boolean }>();
(globalThis as Record<symbol, unknown>)[Symbol.for('parche.preview')] = als;

let container: AstroContainer | null = null;
async function render(node: Record<string, unknown>) {
  container ??= await AstroContainer.create();
  return container.renderToString(Node, { props: { node, widgets: { Section, Column }, defaultWrapper: 'Section' } });
}

const tree = { widget: 'Section', id: 'n_band', props: { id: 'x' }, slots: { default: [{ widget: 'Column', id: 'n_col' }] } };

test('outside a preview context a node renders as always: no markers', async () => {
  expect(await render(tree)).not.toContain('parche-node');
});

test('inside one, each node with an id marks its start and end, nested', async () => {
  const html = await als.run({ drafts: new Map(), markers: true }, () => render(tree));
  const order = [...html.matchAll(/<!--(\/?)parche-node:([\w.-]+)-->/g)].map((m) => m[1] + m[2]);
  expect(order).toEqual(['n_band', 'n_col', '/n_col', '/n_band']);
});

test('a wrapped node is marked once, around its band; an id that could break a comment is not marked', async () => {
  const wrapped = await als.run({ drafts: new Map(), markers: true }, () => render({ widget: 'Column', id: 'n_w', wrapper: { props: { tone: 'muted' } } }));
  expect(wrapped.match(/<!--parche-node:n_w-->/g)?.length).toBe(1);
  expect(wrapped.indexOf('<!--parche-node:n_w-->')).toBeLessThan(wrapped.indexOf('parche-section'));
  const evil = await als.run({ drafts: new Map(), markers: true }, () => render({ widget: 'Column', id: 'x--><script>' }));
  expect(evil).not.toContain('parche-node');
});
