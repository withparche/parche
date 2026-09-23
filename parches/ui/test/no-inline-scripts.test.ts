/**
 * The ui parche ships no client script of its own: every behaviour lives in
 * an element (`@parche/elements`), which the widgets compose. A `<script>`
 * in a widget or layout is a regression: it would be a third way to do
 * interactivity, next to elements and core's own components.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');

function astroFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? astroFiles(path.join(dir, e.name)) : e.name.endsWith('.astro') ? [path.join(dir, e.name)] : []));
}

test('no inline <script> in the ui parche: behaviour lives in elements', () => {
  const offenders = astroFiles(SRC).filter((f) => /<script(\s|>)/.test(fs.readFileSync(f, 'utf8')));
  assert.deepEqual(
    offenders.map((f) => path.relative(SRC, f)),
    [],
    'these files carry a <script>; move the behaviour into an element',
  );
});

test('no client script files in the ui parche', () => {
  assert.ok(!fs.existsSync(path.join(SRC, 'scripts')), 'src/scripts/ should not exist');
});
