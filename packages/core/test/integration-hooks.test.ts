import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import parche from '../src/integration/index.ts';

const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const GOOD_ASTRO = path.join(FIXTURES, 'Button.astro'); // a widget file that exists; no props beside it

/** Astro's hook parameters, faked: every call recorded, the logger's warnings kept. */
function fakes(root: string, config: Record<string, unknown> = {}) {
  const calls = { updateConfig: [] as any[], injectRoute: [] as any[], addMiddleware: [] as any[], addWatchFile: [] as string[], warn: [] as string[], injectTypes: [] as any[] };
  const logger: any = { warn: (m: string) => calls.warn.push(m), info() {}, error() {}, debug() {}, fork: () => logger };
  const astroConfig = {
    root: pathToFileURL(root + path.sep),
    srcDir: pathToFileURL(path.join(root, 'src') + path.sep),
    integrations: [],
    base: '/',
    output: 'static',
    fonts: [],
    image: {},
    ...config,
  };
  const params: any = {
    command: 'build',
    config: astroConfig,
    logger,
    updateConfig: (c: unknown) => calls.updateConfig.push(c),
    injectRoute: (r: unknown) => calls.injectRoute.push(r),
    addMiddleware: (m: unknown) => calls.addMiddleware.push(m),
    addWatchFile: (f: string | URL) => calls.addWatchFile.push(String(f)),
    injectTypes: (t: unknown) => (calls.injectTypes.push(t), new URL('file:///injected')),
  };
  return { calls, params };
}

const hooks = (input: Parameters<typeof parche>[0]) => parche(input).hooks as Record<string, (p: any) => Promise<void> | void>;

test('setup: the page route, its middleware and, for a server build, the content check are injected; the site config reaches Astro', async () => {
  const { calls, params } = fakes(FIXTURES, { output: 'server' });
  await hooks({ brand: { name: 'X' }, i18n: { defaultLocale: 'en', locales: ['en', 'es'] }, parches: [{ name: 'p', widgets: { Good: GOOD_ASTRO } }] as any, routes: { pages: true } })['astro:config:setup'](params);
  const patterns = calls.injectRoute.map((r) => r.pattern);
  assert.ok(patterns.includes('[...slug]'));
  assert.ok(patterns.includes('__parche-check.json'));
  assert.equal(calls.injectRoute.find((r) => r.pattern === '__parche-check.json').prerender, true);
  assert.equal(calls.addMiddleware.length, 1);
  assert.match(calls.addMiddleware[0].entrypoint, /routes[\\/]middleware\.ts$/);
  // The i18n a site declares in its config is handed to Astro, at Astro's routing defaults.
  const i18n = calls.updateConfig.find((c) => c.i18n)?.i18n;
  assert.deepEqual(i18n.locales, ['en', 'es']);
  assert.equal(i18n.routing.prefixDefaultLocale, false);
  // The plugin that serves parche:* is registered.
  const plugins = calls.updateConfig.flatMap((c) => c.vite?.plugins ?? []);
  assert.ok(plugins.some((p: any) => p.name === 'vite-plugin-parche'));
  assert.deepEqual(calls.warn, []);
});

test('setup: a static build injects no check route; pages off injects nothing of core', async () => {
  const on = fakes(FIXTURES);
  await hooks({ brand: { name: 'X' }, routes: { pages: true } })['astro:config:setup'](on.params);
  assert.deepEqual(on.calls.injectRoute.map((r) => r.pattern), ['[...slug]']);
  const off = fakes(FIXTURES);
  await hooks({ brand: { name: 'X' } })['astro:config:setup'](off.params);
  assert.deepEqual(off.calls.injectRoute, []);
  assert.deepEqual(off.calls.addMiddleware, []);
});

test("setup: what does not stop the build is said through Astro's logger", async () => {
  const { calls, params } = fakes(FIXTURES);
  await hooks({ brand: { name: 'X' }, parches: [{ name: 'a', widgets: { Good: GOOD_ASTRO } }, { name: 'b', widgets: { Good: path.join(FIXTURES, 'wrapping', 'Plain.astro') } }] as any })['astro:config:setup'](params);
  assert.equal(calls.warn.length, 1);
  assert.match(calls.warn[0], /Duplicate registrations/);
  assert.doesNotMatch(calls.warn[0], /^\[parche\]/);
});

test('setup, in dev: the site config file is watched, so a change restarts the server', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'parche-hooks-'));
  fs.mkdirSync(path.join(root, 'src'));
  fs.writeFileSync(path.join(root, 'src', 'parche.config.json'), JSON.stringify({ brand: { name: 'X' } }));
  const { calls, params } = fakes(root);
  params.command = 'dev';
  await hooks({ routes: { pages: true } })['astro:config:setup'](params);
  assert.deepEqual(calls.addWatchFile, [path.join(root, 'src', 'parche.config.json')]);
  // A build watches nothing: there is no server to restart.
  const build = fakes(root);
  await hooks({ routes: { pages: true } })['astro:config:setup'](build.params);
  assert.deepEqual(build.calls.addWatchFile, []);
});

test("config done: parche.d.ts names what the site's parches provide", async () => {
  const { calls, params } = fakes(FIXTURES);
  const h = hooks({ brand: { name: 'X' }, i18n: { defaultLocale: 'en', locales: ['en', 'es'] }, parches: [{ name: 'p', widgets: { Good: GOOD_ASTRO }, templates: { post: GOOD_ASTRO }, themes: [{ label: 'Night', value: 'night' }] }] as any });
  await h['astro:config:setup'](params);
  h['astro:config:done'](params);
  assert.equal(calls.injectTypes.length, 1);
  const { filename, content } = calls.injectTypes[0];
  assert.equal(filename, 'parche.d.ts');
  assert.match(content, /type Widget = "Good";/);
  assert.match(content, /type Template = "post";/);
  assert.match(content, /type Locale = "en" \| "es";/);
  assert.match(content, /type Theme = "" \| "night";/);
  assert.match(content, /type App = never;/);
});

test('build done: the content check leaves no file behind, and robots.txt is written', async () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'parche-build-'));
  fs.writeFileSync(path.join(out, '__parche-check.json'), '{}');
  const { params } = fakes(FIXTURES);
  const h = hooks({ brand: { name: 'X' }, site: 'https://ex.com', seo: { allowAICrawlers: false } });
  await h['astro:config:setup'](params);
  await h['astro:build:done']({ dir: pathToFileURL(out + path.sep), logger: params.logger });
  assert.equal(fs.existsSync(path.join(out, '__parche-check.json')), false);
  const robots = fs.readFileSync(path.join(out, 'robots.txt'), 'utf8');
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /GPTBot/);
});
