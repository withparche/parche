import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateTree } from '../src/content/validate.ts';

const widgets = {
  Section: { slots: { default: {} } },
  Switch: { slots: { '*': { allow: ['Prose', 'Image'] } } },
  Hero: { slots: { media: { allow: ['Image', 'Form'], max: 1 } }, wrapper: false },
  Columns: { slots: { default: { allow: ['Column'], min: 2, max: 4 } } },
  Column: { slots: { default: {} } },
  Image: {},
  Form: {},
  Prose: {},
};
const ctx = { widgets, tones: ['default', 'muted', 'glow'], wrapper: 'Section' };
const messages = (issues: { message: string }[]) => issues.map((i) => i.message);

test('a well-formed tree has no issues', () => {
  const issues = validateTree(
    [
      { widget: 'Hero', slots: { media: [{ widget: 'Form' }] } },
      { widget: 'Section', props: { tone: 'muted' }, slots: { default: [{ widget: 'Columns', slots: { default: [{ widget: 'Column' }, { widget: 'Column', slots: { default: [{ widget: 'Prose' }] } }] } }] } },
      { widget: 'Outlet' },
      { widget: 'pattern/pricing-with-faq' },
    ],
    ctx,
  );
  assert.deepEqual(issues, []);
});

test('unknown widgets, undeclared slots and disallowed children are reported with a path', () => {
  const issues = validateTree(
    [
      { widget: 'Nope' },
      { widget: 'Prose', slots: { default: [{ widget: 'Image' }] } },
      { widget: 'Hero', slots: { media: [{ widget: 'Prose' }], aside: [] } },
    ],
    ctx,
  );
  assert.deepEqual(
    issues.map((i) => i.path),
    ['sections[0]', 'sections[1].slots.default', 'sections[2].slots.media[0]', 'sections[2].slots.aside'],
  );
  assert.match(issues[0].message, /unknown widget "Nope"/);
  assert.match(issues[1].message, /declares no slots/);
  assert.match(issues[2].message, /"Prose" is not allowed in "Hero".media/);
  assert.match(issues[3].message, /no slot "aside" \(it declares: media\)/);
});

test('a `*` slot accepts any name, with its own allow list', () => {
  const ok = validateTree([{ widget: 'Switch', slots: { agency: [{ widget: 'Prose' }], saas: [{ widget: 'Image' }] } }], ctx);
  assert.deepEqual(ok, []);
  const bad = validateTree([{ widget: 'Switch', slots: { agency: [{ widget: 'Form' }] } }], ctx);
  assert.equal(bad.length, 1);
  assert.match(bad[0].message, /"Form" is not allowed in "Switch".agency/);
});

test('min, max and tones are checked; depth is not limited', () => {
  const deep = (n: number): any => (n === 0 ? { widget: 'Prose' } : { widget: 'Column', slots: { default: [deep(n - 1)] } });
  const issues = validateTree(
    [
      { widget: 'Columns', slots: { default: [{ widget: 'Column' }] } },
      { widget: 'Hero', slots: { media: [{ widget: 'Image' }, { widget: 'Image' }] } },
      { widget: 'Section', props: { tone: 'neon' } },
      deep(8),
    ],
    ctx,
  );
  const m = messages(issues);
  assert.ok(m.some((x) => /at least 2/.test(x)));
  assert.ok(m.some((x) => /at most 1/.test(x)));
  assert.ok(m.some((x) => /tone "neon" is not registered/.test(x)));
  assert.equal(m.length, 3, 'nesting eight deep is the site\'s call');
});

test("a node's own wrapper must be a known widget with a default slot, and its tone registered", () => {
  const ok = validateTree([{ widget: 'Prose', wrapper: { props: { id: 'a', tone: 'muted' } } }, { widget: 'Image', wrapper: { widget: 'Column' } }, { widget: 'Prose', wrapper: false }], ctx);
  assert.deepEqual(ok, []);
  const bad = validateTree(
    [
      { widget: 'Prose', wrapper: { widget: 'Nope' } },
      { widget: 'Prose', wrapper: { widget: 'Image' } },
      { widget: 'Prose', wrapper: { props: { tone: 'neon' } } },
    ],
    ctx,
  );
  assert.deepEqual(bad.map((i) => i.path), ['sections[0].wrapper', 'sections[1].wrapper', 'sections[2].wrapper']);
  assert.match(bad[0].message, /unknown wrapper widget "Nope"/);
  assert.match(bad[1].message, /"Image" cannot wrap/);
  assert.match(bad[2].message, /tone "neon" is not registered/);
  // No default wrapper to fall back on.
  assert.match(validateTree([{ widget: 'Prose', wrapper: { props: {} } }], { ...ctx, wrapper: null })[0].message, /names no widget/);
});
