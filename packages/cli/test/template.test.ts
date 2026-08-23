import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { slug, titleCase, runPrompts, applyValues } from '../src/lib/template.ts';

test('slug: kebab-cases, trims, and falls back to "app"', () => {
  assert.equal(slug('My Cool App'), 'my-cool-app');
  assert.equal(slug('Foo!!__Bar'), 'foo-bar');
  assert.equal(slug('  --Edge--  '), 'edge');
  assert.equal(slug(''), 'app');
  assert.equal(slug('!!!'), 'app');
});

test('titleCase: from kebab/snake, and falls back to "App"', () => {
  assert.equal(titleCase('my-cool-app'), 'My Cool App');
  assert.equal(titleCase('hello_world'), 'Hello World');
  assert.equal(titleCase(''), 'App');
});

test('runPrompts (yes): smart defaults for known keys, manifest default otherwise', async () => {
  const manifest = {
    prompts: [
      { key: 'siteName', message: 'Site name' },
      { key: 'packageName', message: 'Package name' },
      { key: 'tagline', message: 'Tagline', default: 'Built with Parche' },
    ],
  };
  const values = await runPrompts(manifest, { projectName: 'My Blog', yes: true });
  assert.deepEqual(values, {
    siteName: 'My Blog', // titleCase(projectName)
    packageName: 'my-blog', // slug(projectName)
    tagline: 'Built with Parche', // manifest default
  });
});

test('runPrompts (yes): no manifest → defaults to a packageName prompt', async () => {
  const values = await runPrompts(null, { projectName: 'Acme Site', yes: true });
  assert.equal(values?.packageName, 'acme-site');
});

test('applyValues: replaces placeholders, patches package.json name, deletes manifest, skips binaries + node_modules', () => {
  const dir = mkdtempSync(join(tmpdir(), 'parche-cli-'));
  writeFileSync(join(dir, 'astro.config.mjs'), "site: { name: '{{siteName}}' }");
  writeFileSync(join(dir, 'parche.config.ts'), "name: '{{ siteName }}'"); // whitespace variant
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: '{{packageName}}', private: true }));
  writeFileSync(join(dir, 'parche.template.json'), '{"name":"hello"}');
  writeFileSync(join(dir, 'logo.png'), '{{siteName}}'); // binary ext → must NOT be touched
  mkdirSync(join(dir, 'node_modules', 'x'), { recursive: true });
  writeFileSync(join(dir, 'node_modules', 'x', 'f.ts'), '{{siteName}}'); // DIR_SKIP → untouched

  applyValues(dir, { siteName: 'Acme', packageName: 'acme' }, 'Acme');

  assert.match(readFileSync(join(dir, 'astro.config.mjs'), 'utf8'), /name: 'Acme'/);
  assert.match(readFileSync(join(dir, 'parche.config.ts'), 'utf8'), /name: 'Acme'/); // whitespace form replaced
  assert.equal(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name, 'acme');
  assert.equal(existsSync(join(dir, 'parche.template.json')), false, 'manifest deleted');
  assert.equal(readFileSync(join(dir, 'logo.png'), 'utf8'), '{{siteName}}', 'binary untouched');
  assert.equal(readFileSync(join(dir, 'node_modules', 'x', 'f.ts'), 'utf8'), '{{siteName}}', 'node_modules skipped');
});

test('applyValues: unknown placeholders are left intact', () => {
  const dir = mkdtempSync(join(tmpdir(), 'parche-cli-'));
  writeFileSync(join(dir, 'a.txt'), '{{known}} and {{unknown}}');
  applyValues(dir, { known: 'X' }, 'proj');
  assert.equal(readFileSync(join(dir, 'a.txt'), 'utf8'), 'X and {{unknown}}');
});
