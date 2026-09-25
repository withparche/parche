import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inline } from '../src/_shared/inline.ts';

test('strong, emphasis, code, link, highlight and line breaks', () => {
  assert.equal(inline('**Fast** and *calm*'), '<strong>Fast</strong> and <em>calm</em>');
  assert.equal(inline('run `npm run dev` now'), 'run <code class="parche-code">npm run dev</code> now');
  assert.equal(inline('see [the docs](/docs)'), 'see <a href="/docs">the docs</a>');
  assert.equal(inline('Ship ==today=='), 'Ship <mark class="parche-mark">today</mark>');
  assert.equal(inline('Ship the website.\nSkip the setup.'), 'Ship the website.<br />Skip the setup.');
  assert.equal(inline('an _aside_ here'), 'an <em>aside</em> here');
});

test('nothing inside code is Markdown, and code is escaped', () => {
  assert.equal(inline('`**not bold** <b>`'), '<code class="parche-code">**not bold** &lt;b&gt;</code>');
});

test('HTML already in the text passes through, attributes untouched', () => {
  const html = "Your site <span class='text_primary'>starts *here*</span>";
  assert.equal(inline(html), "Your site <span class='text_primary'>starts <em>here</em></span>");
  assert.equal(inline("<a href='/a_b_c' target='_blank'>x</a>"), "<a href='/a_b_c' target='_blank'>x</a>");
});

test('snake_case, maths and stray markers stay as written', () => {
  assert.equal(inline('use snake_case_names'), 'use snake_case_names');
  assert.equal(inline('2 * 3 * 4'), '2 * 3 * 4');
  assert.equal(inline('a == b'), 'a == b');
});

test('unsafe link schemes are left as text; empty is undefined', () => {
  assert.equal(inline('[x](javascript:alert(1))'), '[x](javascript:alert(1))');
  assert.equal(inline(''), undefined);
  assert.equal(inline(undefined), undefined);
});
