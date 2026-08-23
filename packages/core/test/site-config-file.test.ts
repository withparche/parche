import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveSiteConfigPath, tryLoadSiteConfig } from '../src/integration/load-site-config.ts';
import { siteConfigSchema } from '../src/types/config.ts';

/** A throwaway project directory. */
function project(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'parche-cfg-'));
  for (const [name, body] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), body);
  }
  return dir;
}

const JSON_CONFIG = JSON.stringify({
  site: 'https://example.com',
  brand: { name: 'Acme', description: 'From a CMS.' },
});

test('probes for a config file when none is named', () => {
  const dir = project({ 'parche.config.json': JSON_CONFIG });
  assert.equal(resolveSiteConfigPath(dir, undefined), path.join(dir, 'parche.config.json'));
});

test('a TypeScript config wins the probe over JSON', () => {
  const dir = project({ 'parche.config.json': JSON_CONFIG, 'parche.config.ts': 'export default {};' });
  assert.equal(resolveSiteConfigPath(dir, undefined), path.join(dir, 'parche.config.ts'));
});

test('an explicit path is honoured, and a missing one resolves to null', () => {
  const dir = project({ 'custom.json': JSON_CONFIG });
  assert.equal(resolveSiteConfigPath(dir, './custom.json'), path.join(dir, 'custom.json'));
  assert.equal(resolveSiteConfigPath(dir, './nope.json'), null);
  assert.equal(resolveSiteConfigPath(dir, undefined), null);
});

test('a JSON config is validated, so it gets the same defaults a TS one gets', async () => {
  // JSON has no defineConfig call to apply the schema — this is what makes a
  // CMS-authored file behave identically to a hand-written TypeScript one.
  const dir = project({ 'parche.config.json': JSON_CONFIG });
  const config = await tryLoadSiteConfig(dir, undefined);

  assert.equal(config?.brand.name, 'Acme');
  assert.equal((config as any).site, 'https://example.com');
  assert.deepEqual(config?.metadata.defaultRobots, {
    maxSnippet: -1,
    maxImagePreview: 'large',
    maxVideoPreview: -1,
  });
  assert.equal(config?.metadata.defaultOgType, 'website');
  assert.deepEqual(config?.metadata.organization, undefined); // opt-in, not implied
});

test('an invalid JSON config fails loudly rather than silently', async () => {
  const dir = project({ 'parche.config.json': JSON.stringify({ brand: {} }) }); // name missing
  await assert.rejects(() => tryLoadSiteConfig(dir, undefined));
});

test('an absent block still gets its nested defaults', () => {
  // Zod hands a `.default` value back untouched, so `.default({})` would have
  // left this empty while a block written as `{}` got filled in.
  const absent = siteConfigSchema.parse({ brand: { name: 'X' } });
  const present = siteConfigSchema.parse({ brand: { name: 'X' }, metadata: { defaultRobots: {} } });
  assert.deepEqual(absent.metadata.defaultRobots, present.metadata.defaultRobots);
});
