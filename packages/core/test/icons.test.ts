import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { usedIcons } from '../src/icons.ts';

/** A throwaway site with a page, a widget of its own, and a parche's sources elsewhere. */
function site() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'parche-icons-'));
  const write = (rel: string, text: string) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  };
  write('src/content/pages/en/home.json', JSON.stringify({ sections: [{ widget: 'Features', props: { items: [{ icon: 'tabler:check' }, { icon: 'tabler:x' }] } }] }));
  write('src/widgets/Mine.astro', '<Icon name="tabler:arrow-right" /> <a href="https://example.com/x:y">data:image/png;base64,AAA</a>');
  write('src/content/posts/en/hello.md', '---\ntitle: Hi\n---\nSee lucide:home and mdi:home.');
  write('parche/src/widgets/Hero.astro', "import x from 'parche:config/i18n';\n<Icon name=\"tabler:menu-2\" />");
  write('parche/src/widgets/Hero.defaults.json', '{ "icon": "tabler:star" }');
  write('parche/dist/Old.astro', '<Icon name="tabler:never" />');
  return { root, parche: path.join(root, 'parche', 'src') };
}

test('every <set>:<name> in the site and the parches, by installed set, sorted; nothing from dist', () => {
  const { root, parche } = site();
  const manifest = { name: 'p', widgets: { Hero: path.join(parche, 'widgets', 'Hero.astro') }, content: [path.join(parche, '**/*.astro')] } as any;
  assert.deepEqual(usedIcons([manifest], { root, sets: ['tabler', 'lucide'] }), {
    lucide: ['home'],
    tabler: ['arrow-right', 'check', 'menu-2', 'star', 'x'],
  });
});

test('a set not installed is left out, and `also` adds what a scan cannot see', () => {
  const { root } = site();
  assert.deepEqual(usedIcons([], { root, sets: ['tabler'] }), { tabler: ['arrow-right', 'check', 'x'] });
  assert.deepEqual(usedIcons([], { root, sets: ['tabler'], also: { tabler: ['bolt'], mdi: ['home'] } }), { mdi: ['home'], tabler: ['arrow-right', 'bolt', 'check', 'x'] });
});

test('sets come from what the project installs: the demo has Tabler and not Lucide', () => {
  const { root } = site();
  // A root that installs nothing has no set at all.
  assert.deepEqual(usedIcons([], { root }), {});
  // From the demo (its node_modules has @iconify-json/tabler), Tabler counts and Lucide does not.
  const demo = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..', 'demos', 'astrowind');
  const found = usedIcons([{ name: 'p', content: [path.join(root, 'src', '**/*')] } as any], { root: demo });
  assert.ok(found.tabler?.includes('check'));
  assert.equal(found.lucide, undefined);
});
