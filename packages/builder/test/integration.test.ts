import { test } from 'node:test';
import assert from 'node:assert/strict';
import builder from '../src/integration.ts';

const setup = (command: string) => {
  const routes: { pattern: string; entrypoint: string; prerender?: boolean }[] = [];
  const updates: unknown[] = [];
  const hook = builder({ token: 't', previewToken: 'p' }).hooks['astro:config:setup'] as (o: unknown) => void;
  hook({ command, injectRoute: (r: (typeof routes)[number]) => routes.push(r), updateConfig: (c: unknown) => updates.push(c), config: { root: new URL('file:///tmp/site/') } });
  return { routes, updates };
};

test('the builder refuses anything but astro dev, so no build can contain it', () => {
  for (const command of ['build', 'preview', 'sync']) {
    assert.throws(() => setup(command), /runs only under "astro dev"/);
  }
});

test('under dev it adds only /_parche routes, never prerendered, and turns the dev toolbar off', () => {
  const { routes, updates } = setup('dev');
  assert.ok(routes.length >= 10);
  assert.ok(routes.some((r) => r.pattern === '/_parche/api/doc'));
  for (const r of routes) {
    assert.match(r.pattern, /^\/_parche\//);
    assert.equal(r.prerender, false);
    assert.match(r.entrypoint, /packages\/builder\/src\/routes\//);
  }
  assert.deepEqual(updates, [{ devToolbar: { enabled: false } }]);
});
