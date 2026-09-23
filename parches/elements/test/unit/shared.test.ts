/**
 * SSR safety of the client base: every module an element script imports must
 * load on Node with no `window`/`document`, because the same modules are
 * bundled for Cloudflare workerd and evaluated there at request time.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('client entry loads without a DOM', async () => {
  assert.equal(typeof globalThis.window, 'undefined');
  const client = await import('../../src/client.ts');
  assert.equal(typeof client.ParcheElement, 'function');
  assert.equal(typeof client.roving, 'function');
  assert.equal(typeof client.rememberFocus, 'function');
});

test('ParcheElement.define is a no-op without customElements', async () => {
  const { ParcheElement } = await import('../../src/client.ts');
  assert.equal(typeof globalThis.customElements, 'undefined');
  assert.doesNotThrow(() => (ParcheElement as unknown as { define(): void }).define());
});

test('defineElement enforces keyboard + noJs on interactive elements', async () => {
  const { defineElement } = await import('../../src/_shared/meta.ts');
  const base = { label: 'X', description: '', tokens: [], parts: [{ name: 'root', element: 'div' }] };
  assert.doesNotThrow(() => defineElement({ element: base }));
  assert.throws(
    () => defineElement({ element: { ...base, tag: { name: 'parche-x', entry: './x.element.ts' } } }),
    /keyboard map and noJs/,
  );
  assert.doesNotThrow(() =>
    defineElement({ element: { ...base, tag: { name: 'parche-x', entry: './x.element.ts' }, keyboard: { Tab: 'move' }, noJs: 'static' } }),
  );
});
