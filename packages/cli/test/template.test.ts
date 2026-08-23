import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { slug, titleCase, runPrompts, readTemplateNames, adaptProject } from '../src/lib/template.ts';

test('slug and titleCase', () => {
  assert.equal(slug('My Blog'), 'my-blog');
  assert.equal(slug('  Ünïcode!!  '), 'n-code');
  assert.equal(slug('---'), 'app');
  assert.equal(titleCase('my-blog'), 'My Blog');
  assert.equal(titleCase('my_cool_site'), 'My Cool Site');
  assert.equal(titleCase(''), 'App');
});

test('prompts: --yes derives both names from the directory', async () => {
  const names = await runPrompts({ projectName: 'My Blog', yes: true });
  assert.deepEqual(names, { packageName: 'my-blog', siteName: 'My Blog' });
});

/** A template on disk: a real project, no placeholders anywhere. */
function template(name = 'hello-parche', display = 'Hello Parche') {
  const dir = mkdtempSync(join(tmpdir(), 'parche-tpl-'));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name, version: '0.0.1' }, null, 2));
  writeFileSync(join(dir, 'parche.config.ts'), `export default defineConfig({\n  brand: { name: '${display}' },\n});\n`);
  writeFileSync(join(dir, 'README.md'), `# ${display}\n\nBuilt with Parche.\n`);
  mkdirSync(join(dir, 'node_modules'));
  writeFileSync(join(dir, 'node_modules', 'junk.js'), `// ${display}`);
  return dir;
}

test("a template's identity is read from its package.json", () => {
  assert.deepEqual(readTemplateNames(template()), {
    packageName: 'hello-parche',
    siteName: 'Hello Parche',
  });
  assert.equal(readTemplateNames(mkdtempSync(join(tmpdir(), 'parche-empty-'))), null);
});

test('adapt: both the display name and the slug are replaced', () => {
  const dir = template();
  assert.equal(adaptProject(dir, { packageName: 'my-blog', siteName: 'My Blog' }), true);

  assert.match(readFileSync(join(dir, 'parche.config.ts'), 'utf8'), /name: 'My Blog'/);
  assert.match(readFileSync(join(dir, 'README.md'), 'utf8'), /^# My Blog/);
  assert.equal(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name, 'my-blog');
});

test('adapt: node_modules is left alone', () => {
  const dir = template();
  adaptProject(dir, { packageName: 'my-blog', siteName: 'My Blog' });
  assert.match(readFileSync(join(dir, 'node_modules', 'junk.js'), 'utf8'), /Hello Parche/);
});

test('adapt: the display name wins over the slug it contains', () => {
  // 'Hello Parche' and 'hello-parche' overlap; replacing the shorter first would
  // leave the longer one half-rewritten. Longest match goes first.
  const dir = template();
  writeFileSync(join(dir, 'mixed.txt'), 'Hello Parche and hello-parche');
  adaptProject(dir, { packageName: 'my-blog', siteName: 'My Blog' });
  assert.equal(readFileSync(join(dir, 'mixed.txt'), 'utf8'), 'My Blog and my-blog');
});

test('adapt: an unreadable template reports failure instead of throwing', () => {
  // The caller carries on: an unrenamed project still runs, which is the whole
  // point of a template being a working project rather than a stencil.
  const dir = mkdtempSync(join(tmpdir(), 'parche-noname-'));
  assert.equal(adaptProject(dir, { packageName: 'my-blog', siteName: 'My Blog' }), false);
});
