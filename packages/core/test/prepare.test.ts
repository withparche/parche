import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prepareParcheConfig, assertBaseSupported, assertRoutesConsistent, type ParcheConfigContext } from '../src/integration/index.ts';

const CTX: ParcheConfigContext = { command: 'build', mode: 'production', env: {}, tenant: undefined };

test('inline mode keeps collections and fonts in the site config', () => {
  const prepared = prepareParcheConfig(
    {
      brand: { name: 'X' },
      collections: { products: { path: '/p/%slug%', widget: 'Hero' } },
      fonts: [{ name: 'Inter', cssVariable: '--font-sans' }],
    } as any,
    CTX,
  );
  assert.equal(prepared.inlineSiteConfig?.collections?.products.path, '/p/%slug%');
  assert.equal(prepared.inlineSiteConfig?.fonts?.[0].name, 'Inter');
  assert.equal((prepared.userConfig as any).collections, undefined);
});

test('with the site config in a file, collections and fonts in parche({...}) are an error', () => {
  assert.throws(() => prepareParcheConfig({ collections: { products: { path: '/p/%slug%', widget: 'Hero' } } } as any, CTX), /set them there/);
});

test('base other than the root is refused, clearly', () => {
  assert.doesNotThrow(() => assertBaseSupported(undefined, '/'));
  assert.doesNotThrow(() => assertBaseSupported('/', undefined));
  assert.throws(() => assertBaseSupported('/docs', '/'), /base "\/docs" is not supported yet/);
  assert.throws(() => assertBaseSupported(undefined, '/docs/'), /not supported yet/);
});

test("options of Parche's page route need the route", () => {
  assert.doesNotThrow(() => assertRoutesConsistent({ pages: true }, [{ appName: 'blog' }]));
  assert.doesNotThrow(() => assertRoutesConsistent(undefined, []));
  assert.throws(() => assertRoutesConsistent(undefined, [{ appName: 'blog' }, { appName: 'blog' }]), /^Error: \[parche\] blog serve pages through/);
  assert.throws(() => assertRoutesConsistent({ pages: false, middleware: './m.ts' } as any, []), /routes\.middleware/);
});
