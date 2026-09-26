import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { siteConfigSchema } from '@parche/astro/config';
import { FileError } from '../src/server/files.ts';
import { readSite, writeSite } from '../src/server/site.ts';

const file = (text: string) => {
  const f = join(mkdtempSync(join(tmpdir(), 'parche-site-')), 'parche.config.json');
  writeFileSync(f, text);
  return f;
};

test("a JSON site config is read with its etag and written in the file's own indentation", async () => {
  const f = file('{\n\t"site": "https://a.example",\n\t"brand": { "name": "A" }\n}\n');
  const site = await readSite(f);
  assert.equal(site.readOnly, false);
  assert.deepEqual(site.data, { site: 'https://a.example', brand: { name: 'A' } });
  const saved = await writeSite(f, site.etag, { site: 'https://a.example', brand: { name: 'B' } }, siteConfigSchema);
  assert.equal(readFileSync(f, 'utf8'), '{\n\t"site": "https://a.example",\n\t"brand": {\n\t\t"name": "B"\n\t}\n}\n');
  assert.notEqual(saved.etag, site.etag);
});

test('a stale etag is a conflict; a config the schema refuses is 422 with its paths; nothing written', async () => {
  const text = '{\n  "brand": { "name": "A" }\n}\n';
  const f = file(text);
  const { etag } = await readSite(f);
  await assert.rejects(writeSite(f, 'stale', { brand: { name: 'B' } }, siteConfigSchema), (e) => e instanceof FileError && e.status === 409);
  await assert.rejects(
    writeSite(f, etag, { brand: {} }, siteConfigSchema),
    (e) => e instanceof FileError && e.status === 422 && (e.detail as { issues: { path: string }[] }).issues.some((i) => i.path === 'brand.name'),
  );
  assert.equal(readFileSync(f, 'utf8'), text);
});

test('an identity declared inline in astro.config is read-only', async () => {
  assert.deepEqual(await readSite(null), { data: {}, etag: '', readOnly: true });
  await assert.rejects(writeSite(null, '', {}, siteConfigSchema), (e) => e instanceof FileError && e.status === 400);
});
