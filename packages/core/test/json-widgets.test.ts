import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defineJsonWidget, instantiate, checkDefinition, checkUses, parseUse, type JsonWidget } from '../src/content/json-widgets.ts';

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

function widget(data: unknown = card, name = 'LinkCard'): JsonWidget {
  const { widget, error } = defineJsonWidget(name, data);
  assert.ok(widget, error);
  return widget!;
}

test('a use gets its defaults, and placeholders take the values, dotted paths included', () => {
  const w = widget();
  const { props, issues } = parseUse(w, { title: 'Hi', link: { text: 'Go', href: '/go' } }, 'sections[0]');
  assert.deepEqual(issues, []);
  assert.equal(props.tone, 'plain');
  const [section] = instantiate(w.tree, props);
  assert.deepEqual(section.props, { tone: 'plain' });
  assert.deepEqual(section.slots!.default[0].props, { title: 'Hi', href: '/go', actions: [{ text: 'Go', href: '/go' }] });
});

test('a placeholder with no value drops its key or its array item, so the inner default applies', () => {
  const w = widget();
  const [section] = instantiate(w.tree, { title: 'Hi' });
  assert.deepEqual(section.slots!.default[0].props, { title: 'Hi', actions: [] });
});

test('a use is refused with the page path: missing, wrong type, unknown prop', () => {
  const w = widget();
  const { issues } = parseUse(w, { titel: 'Hi', tone: 'loud' }, 'sections[2]');
  const paths = issues.map((i) => i.path).sort();
  assert.deepEqual(paths, ['sections[2].props', 'sections[2].props.title', 'sections[2].props.tone']);
});

test('a definition is checked against itself: undeclared placeholders and unused props', () => {
  const w = widget({
    ...card,
    props: { type: 'object', properties: { title: { type: 'string' }, extra: { type: 'number' } } },
  });
  const messages = checkDefinition(w).map((i) => i.message).join('\n');
  assert.match(messages, /"\$prop": "tone" } names a prop the definition does not declare/);
  assert.match(messages, /"\$prop": "link.href" } names a prop/);
  assert.match(messages, /"extra" is declared but no/);
});

test('a definition that is not one is reported, not thrown', () => {
  assert.match(defineJsonWidget('Bad', { label: 'x', tree: [] }).error!, /tree/);
  assert.match(defineJsonWidget('Bad', { label: 'x', props: { type: 'string' }, tree: [{ widget: 'A' }] }).error!, /props/);
});

test('uses nested in slots and inside other JSON widgets are validated with their real values', () => {
  const inner = widget();
  const outer = widget(
    {
      label: 'Two cards',
      props: { type: 'object', properties: { first: { type: 'string' } }, required: ['first'] },
      tree: [{ widget: 'LinkCard', props: { title: { $prop: 'first' }, tone: 'loud' } }],
    },
    'TwoCards',
  );
  const widgets = { LinkCard: inner, TwoCards: outer };
  const issues = checkUses([{ widget: 'Section', slots: { default: [{ widget: 'TwoCards', props: { first: 'A' } }] } }], widgets);
  assert.deepEqual(issues.map((i) => i.path), ['sections[0].slots.default[0]>TwoCards.tree[0].props.tone']);
});

test('a JSON widget that uses itself stops at the nesting limit', () => {
  const loop = widget({ label: 'Loop', tree: [{ widget: 'Loop' }] }, 'Loop');
  const issues = checkUses([{ widget: 'Loop' }], { Loop: loop });
  assert.match(issues.at(-1)!.message, /nests JSON widgets more than 3 deep/);
});
