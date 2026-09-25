import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blocks, slug } from '../src/_shared/blocks.ts';

test('headings get ids and are returned for a table of contents', () => {
  const { html, headings } = blocks('## Install the CLI\n\nText.\n\n### Node 20 or later');
  assert.match(html, /<h2 id="install-the-cli">Install the CLI<\/h2>/);
  assert.match(html, /<h3 id="node-20-or-later">/);
  assert.deepEqual(headings.map((h) => [h.depth, h.slug]), [[2, 'install-the-cli'], [3, 'node-20-or-later']]);
});

test('paragraphs, lists, code fences, quotes and inline Markdown', () => {
  const { html } = blocks('One **bold**\nline.\n\n- a\n- `b`\n\n1. first\n2. second\n\n```bash\nnpm i <x>\n```\n\n> A quote');
  assert.match(html, /<p>One <strong>bold<\/strong> line\.<\/p>/);
  assert.match(html, /<ul><li>a<\/li><li><code class="parche-code">b<\/code><\/li><\/ul>/);
  assert.match(html, /<ol><li>first<\/li><li>second<\/li><\/ol>/);
  assert.match(html, /<pre data-lang="bash"><code class="language-bash">npm i &lt;x&gt;<\/code><\/pre>/);
  assert.match(html, /<blockquote><p>A quote<\/p><\/blockquote>/);
});

test('slug drops accents, marks and punctuation', () => {
  assert.equal(slug('Qué **es** `cadence.json`?'), 'que-es-cadence-json');
});
