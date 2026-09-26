import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { FileError } from '../src/server/files.ts';
import { readTokens, writeTokens } from '../src/server/tokens.ts';

const known = new Set(['--ds-sys-color-primary', '--ds-sys-color-surface']);
const site = () => {
  const root = mkdtempSync(join(tmpdir(), 'parche-tokens-'));
  mkdirSync(join(root, 'src'));
  return root;
};

test('no file is no overrides; a save creates it, then needs its etag', async () => {
  const root = site();
  assert.deepEqual(await readTokens(root), { overrides: {}, etag: '', exists: false });
  const saved = await writeTokens(root, '', { base: { light: { '--ds-sys-color-primary': 'oklch(0.5 0.1 150)' } } }, known);
  assert.ok(saved.etag);
  assert.equal(readFileSync(join(root, 'src/parche.tokens.json'), 'utf8'), '{\n  "base": {\n    "light": {\n      "--ds-sys-color-primary": "oklch(0.5 0.1 150)"\n    }\n  }\n}\n');
  await assert.rejects(writeTokens(root, '', { base: {} }, known), (e) => e instanceof FileError && e.status === 409);
});

test('an unknown name or an unsafe value is refused with its path; nothing written', async () => {
  const root = site();
  await assert.rejects(
    writeTokens(root, '', { base: { light: { '--ds-sys-color-nope': 'red', '--ds-sys-color-primary': 'red;}' } } }, known),
    (e) => e instanceof FileError && e.status === 422 && (e.detail as { issues: { path: string }[] }).issues.length === 2,
  );
  assert.equal(existsSync(join(root, 'src/parche.tokens.json')), false);
});

test('saving none at all removes the file', async () => {
  const root = site();
  writeFileSync(join(root, 'src/parche.tokens.json'), '{"themes":{"product":{"dark":{"--ds-sys-color-surface":"black"}}}}');
  const { etag, overrides } = await readTokens(root);
  assert.deepEqual(overrides, { themes: { product: { dark: { '--ds-sys-color-surface': 'black' } } } });
  await writeTokens(root, etag, {}, known);
  assert.equal(existsSync(join(root, 'src/parche.tokens.json')), false);
});
