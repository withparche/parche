import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveBlogConfig } from '../src/types.ts';

test('dateFormat defaults to what the widgets already rendered', () => {
  // Changing the option's type must not change anyone's output until they ask.
  assert.deepEqual(resolveBlogConfig().dateFormat, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

test('dateFormat is passed through untouched', () => {
  const opts: Intl.DateTimeFormatOptions = { dateStyle: 'full' };
  assert.deepEqual(resolveBlogConfig({ dateFormat: opts }).dateFormat, opts);
});

test('the same options render differently per locale, which is the point', () => {
  // A token template like 'MMMM d, yyyy' would have baked English word order into
  // the config. Intl knows that Spanish reverses the order and adds connectives.
  const date = new Date('2026-08-12T00:00:00Z');
  const format = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' } as const;

  assert.equal(date.toLocaleDateString('en-US', format), 'August 12, 2026');
  assert.equal(date.toLocaleDateString('es', format), '12 de agosto de 2026');
});

test('other blog defaults are unchanged', () => {
  const cfg = resolveBlogConfig();
  assert.equal(cfg.postsPerPage, 12);
  assert.equal(cfg.readingTime, true);
  assert.equal(cfg.wordsPerMinute, 200);
  assert.equal(cfg.series, false);
  assert.equal(cfg.permalinks.post, '/blog/%slug%');
});
