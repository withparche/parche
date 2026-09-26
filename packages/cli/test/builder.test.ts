import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { BuilderSetupError, builderTokens, resolveBuilderProject } from '../src/lib/builder.ts';

test('the project\'s own astro and @parche/builder are resolved from its package.json', () => {
  const demo = fileURLToPath(new URL('../../../demos/astrowind', import.meta.url));
  const p = resolveBuilderProject(demo);
  assert.equal(p.root, demo);
  assert.match(p.astro, /^file:.*\/astro\//);
  assert.match(p.builder, /^file:.*\/builder\/dist\/integration\.js$/);
});

test('a folder that is not a project, or lacks the builder, says what to do', () => {
  const empty = mkdtempSync(join(tmpdir(), 'parche-builder-'));
  assert.throws(() => resolveBuilderProject(empty), (e) => e instanceof BuilderSetupError && /No package.json/.test(e.message));
  writeFileSync(join(empty, 'package.json'), '{"name":"x"}');
  assert.throws(() => resolveBuilderProject(empty), (e) => e instanceof BuilderSetupError && /astro is not installed/.test(e.message));
});

test('each session gets fresh, distinct secrets', () => {
  const a = builderTokens();
  const b = builderTokens();
  assert.notEqual(a.token, b.token);
  assert.notEqual(a.token, a.previewToken);
  assert.ok(a.token.length >= 32);
});
