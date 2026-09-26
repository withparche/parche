import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkPlacements } from '../src/utils/placements.ts';

const ad = { widget: 'AdSlot', props: { slot: 'x' } };

test('an ad after the title is fine; before it, or before the first paragraph, is not', () => {
  assert.deepEqual(checkPlacements({ sections: [{ widget: 'blog/ArticleHeader' }, ad] }), []);
  assert.match(checkPlacements({ sections: [ad, { widget: 'blog/PageHeader' }] })[0], /before the page's title/);
  const before = { widget: 'blog/ArticleBody', slots: { before: [ad] } };
  assert.match(checkPlacements({ sections: [{ widget: 'blog/ArticleHeader' }, before] }).join(), /between the title and the first paragraph/);
  const inArticle = { widget: 'blog/ArticleBody', slots: { inArticle: [ad] } };
  assert.deepEqual(checkPlacements({ sections: [{ widget: 'blog/ArticleHeader' }, inArticle] }), []);
});

test('a view without a title may open with an ad (a magazine front after its lead)', () => {
  assert.deepEqual(checkPlacements({ sections: [{ widget: 'blog/Featured' }, ad] }), []);
});

test("every preset's views keep the rules", () => {
  const dir = join(dirname(fileURLToPath(import.meta.url)), '../src/views');
  for (const preset of readdirSync(dir).filter((f) => !f.includes('.'))) {
    for (const file of readdirSync(join(dir, preset))) {
      assert.deepEqual(checkPlacements(JSON.parse(readFileSync(join(dir, preset, file), 'utf8'))), [], `${preset}/${file}`);
    }
  }
});
