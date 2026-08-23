import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRegistry } from '../src/integration/registry.ts';

const ROOT = '/tmp/parche-test-root';

/** Run `fn` with console.warn silenced, returning the captured messages. */
function captureWarnings(fn: () => void): string[] {
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (...args: unknown[]) => warnings.push(args.join(' '));
  try {
    fn();
  } finally {
    console.warn = original;
  }
  return warnings;
}

test('empty config: parche:config points at the default root file, no fullBleed', () => {
  const reg = createRegistry({ parches: [] }, ROOT);
  assert.equal(reg.modules['parche:config'], `${ROOT}/parche.config.ts`);
  assert.deepEqual(reg.fullBleedWidgets, []);
  assert.deepEqual(reg.widgetPropRequirements, []);
});

test('inline site config: parche:config is served inline, not from a file', () => {
  const site = { site: { name: 'X', description: '', defaultLanguage: 'en' } } as any;
  const reg = createRegistry({ parches: [] }, ROOT, undefined, site);
  assert.equal(reg.modules['parche:config'], undefined);
  assert.equal(reg.inlineSiteConfig, site);
});

test('fullBleed widgets are collected from every parche manifest', () => {
  captureWarnings(() => {
    const reg = createRegistry(
      {
        parches: [
          { name: 'ui', widgets: { Hero: '/x/Hero.astro' }, fullBleed: ['Hero'] },
          { name: 'extra', widgets: { Banner: '/x/Banner.astro' }, fullBleed: ['Banner'] },
        ],
      },
      ROOT,
    );
    assert.deepEqual(reg.fullBleedWidgets.sort(), ['Banner', 'Hero']);
  });
});

test('duplicate widget across parches warns (last wins), not silent', () => {
  const warnings = captureWarnings(() => {
    createRegistry(
      {
        parches: [
          { name: 'a', widgets: { Hero: '/a/Hero.astro' } },
          { name: 'b', widgets: { Hero: '/b/Hero.astro' } },
        ],
      },
      ROOT,
    );
  });
  assert.ok(
    warnings.some((w) => /Duplicate registrations/.test(w) && /Hero/.test(w)),
    `expected a collision warning, got: ${warnings.join(' | ')}`,
  );
});

test('requires: missing widget throws with attribution', () => {
  assert.throws(
    () =>
      captureWarnings(() =>
        createRegistry(
          { parches: [{ name: 'needs-hero', requires: { widgets: ['Hero'] } }] },
          ROOT,
        ),
      ),
    /needs-hero.*requires widget "Hero"/s,
  );
});

test('requires: missing template and missing peer parche both throw', () => {
  assert.throws(
    () =>
      createRegistry(
        { parches: [{ name: 'p', requires: { templates: ['nope'], parches: [{ name: 'ghost' }] } }] },
        ROOT,
      ),
    /requires template "nope"[\s\S]*requires parche "ghost"/,
  );
});

test('requires: peer parche present satisfies presence', () => {
  captureWarnings(() => {
    const reg = createRegistry(
      {
        parches: [
          { name: 'ui', version: '1.2.0' },
          { name: 'app', requires: { parches: [{ name: 'ui' }] } },
        ],
      },
      ROOT,
    );
    assert.ok(reg);
  });
});

test('requires: peer version range — satisfied passes, unsatisfied throws', () => {
  const build = (range: string) =>
    createRegistry(
      {
        parches: [
          { name: 'ui', version: '1.5.0' },
          { name: 'app', requires: { parches: [{ name: 'ui', version: range }] } },
        ],
      },
      ROOT,
    );
  // ^1.2.0 is satisfied by 1.5.0
  captureWarnings(() => assert.ok(build('^1.2.0')));
  // ^2.0.0 is NOT satisfied by 1.5.0
  assert.throws(() => build('^2.0.0'), /requires "ui@\^2\.0\.0" but found 1\.5\.0/);
});

test('requires: missing primitive and missing theme both throw', () => {
  assert.throws(
    () => createRegistry({ parches: [{ name: 'p', requires: { primitives: ['Button'] } }] }, ROOT),
    /requires primitive "Button"/,
  );
  assert.throws(
    () => createRegistry({ parches: [{ name: 'p', requires: { themes: ['corporate'] } }] }, ROOT),
    /requires theme "corporate"/,
  );
});

test('requires: a provided theme value satisfies a theme requirement', () => {
  const reg = createRegistry(
    {
      parches: [
        { name: 'theme', themes: [{ label: 'Corporate', value: 'corporate' }] },
        { name: 'app', requires: { themes: ['corporate'] } },
      ],
    },
    ROOT,
  );
  assert.ok(reg.themes.some((t) => t.value === 'corporate'));
});

test('bad parche path warns (badPaths) but does not throw', () => {
  const warnings = captureWarnings(() => {
    const reg = createRegistry(
      { parches: [{ name: 'p', widgets: { Hero: '/does/not/exist/Hero.astro' } }] },
      ROOT,
    );
    assert.ok(reg);
  });
  assert.ok(
    warnings.some((w) => /path problems/i.test(w) && /Hero/.test(w) && /file not found/.test(w)),
    `expected a bad-path warning, got: ${warnings.join(' | ')}`,
  );
});

test('requires: structural widget props are recorded for the schema check', () => {
  captureWarnings(() => {
    const reg = createRegistry(
      {
        parches: [
          { name: 'ui', widgets: { Hero: '/x/Hero.astro' } },
          { name: 'app', requires: { widgets: [{ name: 'Hero', props: ['title', 'cta'] }] } },
        ],
      },
      ROOT,
    );
    assert.deepEqual(reg.widgetPropRequirements, [
      { from: 'app', name: 'Hero', props: ['title', 'cta'] },
    ]);
  });
});
