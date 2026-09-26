import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractTOC } from '../src/utils/toc.ts';

test("the anchor is the heading's own id, wherever it sits among the attributes", () => {
  const toc = extractTOC('<h2 class="x" id="why-this-matters" data-y="1">Why this matters</h2>');
  assert.equal(toc[0].slug, 'why-this-matters');
});

test('text and ids are decoded, markup inside a heading dropped', () => {
  const [h] = extractTOC('<h2 id="it&#x27;s">It&#x27;s <code>fine</code> &amp; done</h2>');
  assert.equal(h.text, "It's fine & done");
  assert.equal(h.slug, "it's");
});

test('h3 nest under their h2; a heading without an id gets a slug', () => {
  const toc = extractTOC('<h2 id="a">A</h2><h3 id="a1">A1</h3><h2>Second one</h2>');
  assert.deepEqual(toc.map((i) => [i.slug, i.children.map((c) => c.slug)]), [['a', ['a1']], ['second-one', []]]);
});

test('a visually hidden heading (the footnotes label) is not a section', () => {
  const toc = extractTOC('<h2 id="a">A</h2><h2 id="footnote-label" class="sr-only">Footnotes</h2>');
  assert.deepEqual(toc.map((i) => i.slug), ['a']);
});
