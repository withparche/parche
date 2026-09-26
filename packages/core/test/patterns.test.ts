import { test } from 'node:test';
import assert from 'node:assert/strict';
import { definePattern, instantiate, checkDefinition, checkUses, parseUse, patternsFor, rootWidgets, type Pattern } from '../src/content/patterns.ts';
import { validateTree } from '../src/content/validate.ts';

const card = {
  label: 'Card with a link',
  props: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1 },
      tone: { type: 'string', enum: ['plain', 'muted'], default: 'plain' },
      link: { type: 'object', properties: { text: { type: 'string' }, href: { type: 'string' } }, required: ['href'] },
    },
    required: ['title'],
  },
  tree: [
    {
      widget: 'Section',
      props: { tone: { $prop: 'tone' } },
      slots: { default: [{ widget: 'Callout', props: { title: { $prop: 'title' }, href: { $prop: 'link.href' }, actions: [{ $prop: 'link' }] } }] },
    },
  ],
};

function pattern(data: unknown = card, entry = 'link-card'): Pattern {
  const { pattern, error } = definePattern(entry, data);
  assert.ok(pattern, error);
  return pattern!;
}

test('a use gets its defaults, and placeholders take the values, dotted paths included', () => {
  const w = pattern();
  const { props, issues } = parseUse(w, { title: 'Hi', link: { text: 'Go', href: '/go' } }, 'sections[0]');
  assert.deepEqual(issues, []);
  assert.equal(props.tone, 'plain');
  const [section] = instantiate(w.tree, props);
  assert.deepEqual(section.props, { tone: 'plain' });
  assert.deepEqual(section.slots!.default[0].props, { title: 'Hi', href: '/go', actions: [{ text: 'Go', href: '/go' }] });
});

test('a placeholder with no value drops its key or its array item, so the inner default applies', () => {
  const w = pattern();
  const [section] = instantiate(w.tree, { title: 'Hi' });
  assert.deepEqual(section.slots!.default[0].props, { title: 'Hi', actions: [] });
});

test('a use is refused with the page path: missing, wrong type, unknown prop', () => {
  const w = pattern();
  const { issues } = parseUse(w, { titel: 'Hi', tone: 'loud' }, 'sections[2]');
  const paths = issues.map((i) => i.path).sort();
  assert.deepEqual(paths, ['sections[2].props', 'sections[2].props.title', 'sections[2].props.tone']);
});

test('a definition is checked against itself: undeclared placeholders and unused props', () => {
  const w = pattern({
    ...card,
    props: { type: 'object', properties: { title: { type: 'string' }, extra: { type: 'number' } } },
  });
  const messages = checkDefinition(w).map((i) => i.message).join('\n');
  assert.match(messages, /"\$prop": "tone" } names a prop the pattern does not declare/);
  assert.match(messages, /"\$prop": "link.href" } names a prop/);
  assert.match(messages, /"extra" is declared but no/);
});

test('a definition that is not one is reported, not thrown', () => {
  assert.match(definePattern('bad', { label: 'x', tree: [] }).error!, /tree/);
  assert.match(definePattern('bad', { label: 'x', props: { type: 'string' }, tree: [{ widget: 'A' }] }).error!, /props/);
});

test('a pattern without props is content shared as it is: it takes no props', () => {
  const faq = pattern({ label: 'FAQ', tree: [{ widget: 'FAQs', props: { items: [] } }] }, 'faq');
  assert.deepEqual(parseUse(faq, undefined, 'sections[0]').issues, []);
  assert.deepEqual(parseUse(faq, { title: 'x' }, 'sections[0]').issues.map((i) => i.path), ['sections[0].props']);
});

test('uses nested in slots and inside other patterns are validated with their real values', () => {
  const inner = pattern();
  const outer = pattern(
    {
      label: 'Two cards',
      props: { type: 'object', properties: { first: { type: 'string' } }, required: ['first'] },
      tree: [{ widget: 'pattern/link-card', props: { title: { $prop: 'first' }, tone: 'loud' } }],
    },
    'two-cards',
  );
  const patterns = { 'pattern/link-card': inner, 'pattern/two-cards': outer };
  const issues = checkUses([{ widget: 'Section', slots: { default: [{ widget: 'pattern/two-cards', props: { first: 'A' } }] } }], patterns);
  assert.deepEqual(issues.map((i) => i.path), ['sections[0].slots.default[0]>pattern/two-cards.tree[0].props.tone']);
});

test('a pattern that reaches itself is reported where the loop closes; an unknown one by name', () => {
  const a = pattern({ label: 'A', tree: [{ widget: 'pattern/b' }] }, 'a');
  const b = pattern({ label: 'B', tree: [{ widget: 'Section', slots: { default: [{ widget: 'pattern/a' }] } }] }, 'b');
  const issues = checkUses([{ widget: 'pattern/a' }, { widget: 'pattern/nope' }], { 'pattern/a': a, 'pattern/b': b });
  assert.deepEqual(
    issues.map((i) => i.message),
    ['"pattern/a" uses itself (pattern/a > pattern/b > pattern/a)', 'no pattern "nope" in src/content/patterns'],
  );
});

test("a page's locale wins: pattern/faq is en/faq in English, faq elsewhere", () => {
  const entries = [{ entry: 'faq' }, { entry: 'en/faq' }, { entry: 'tour-step' }];
  assert.equal(patternsFor(entries, 'en')['pattern/faq'].entry, 'en/faq');
  assert.equal(patternsFor(entries, 'es')['pattern/faq'].entry, 'faq');
  assert.equal(patternsFor(entries, 'es')['pattern/tour-step'].entry, 'tour-step');
});

test('where it is used, a pattern stands for its roots: a slot allows it when it allows them, and counts them', () => {
  const cards = pattern({ label: 'Cards', tree: [{ widget: 'Column' }, { widget: 'pattern/one' }] }, 'cards');
  const one = pattern({ label: 'One', tree: [{ widget: 'Column' }] }, 'one');
  const text = pattern({ label: 'Text', tree: [{ widget: 'Callout' }] }, 'text');
  const patterns = { 'pattern/cards': cards, 'pattern/one': one, 'pattern/text': text };
  assert.deepEqual(rootWidgets('pattern/cards', patterns), ['Column', 'Column']);
  const ctx = { widgets: { Columns: { slots: { default: { allow: ['Column'], max: 2 } } }, Column: {}, Callout: {} }, patterns };
  const ok = validateTree([{ widget: 'Columns', slots: { default: [{ widget: 'pattern/cards' }] } }], ctx);
  assert.deepEqual(ok, []);
  const bad = validateTree([{ widget: 'Columns', slots: { default: [{ widget: 'pattern/cards' }, { widget: 'pattern/text' }] } }], ctx).map((i) => i.message);
  assert.deepEqual(bad, ['takes at most 2 node(s), has 3', '"pattern/text" (its "Callout") is not allowed in "Columns".default (allowed: Column)']);
});
