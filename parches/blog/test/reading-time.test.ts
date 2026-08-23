import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateReadingTime } from '../src/utils/reading-time.ts';

test('counts plain words and rounds minutes (min 1)', () => {
  const words = Array(400).fill('word').join(' ');
  const rt = calculateReadingTime(words, 200);
  assert.equal(rt.words, 400);
  assert.equal(rt.minutes, 2); // 400 / 200

  assert.equal(calculateReadingTime('just a few words').minutes, 1); // floored to 1
});

test('respects a custom words-per-minute', () => {
  const words = Array(300).fill('word').join(' ');
  assert.equal(calculateReadingTime(words, 100).minutes, 3);
});

test('strips markdown: code, images, links (keep text), emphasis', () => {
  const rt = calculateReadingTime('`code` [text](https://x) ![alt](/img.png) **bold** plain');
  assert.equal(rt.words, 3); // text, bold, plain
});

test('strips fenced code blocks entirely', () => {
  const rt = calculateReadingTime('one two\n```js\nconst a = 1; const b = 2; more code here\n```\nthree');
  assert.equal(rt.words, 3); // one two three — the code block contributes nothing
});
