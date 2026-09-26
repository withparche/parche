import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { emptyOf, fieldOf, variantOf, type Field } from '../src/editor/forms/schema.ts';

const UI = fileURLToPath(new URL('../../../parches/ui/src/', import.meta.url));
const walk = (dir: string, acc: string[] = []) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (name.endsWith('.props.ts')) acc.push(full);
  }
  return acc;
};
const collect = (f: Field, at: string, acc: string[]) => {
  if (f.kind === 'json') acc.push(at);
  if (f.kind === 'object') f.properties.forEach((p) => collect(p.field, `${at}.${p.key}`, acc));
  if (f.kind === 'array') collect(f.item, `${at}[]`, acc);
  if (f.kind === 'record') collect(f.value, `${at}{}`, acc);
  if (f.kind === 'union') f.variants.forEach((v, i) => collect(v.field, `${at}|${i}`, acc));
  return acc;
};

test('every ui widget\'s props become fields, none left as raw JSON', async () => {
  const raw: string[] = [];
  let widgets = 0;
  for (const file of [...walk(join(UI, 'widgets')), ...walk(join(UI, 'layout'))]) {
    const m = await import(file);
    if (!m.schema) continue;
    widgets++;
    collect(fieldOf(z.toJSONSchema(m.schema) as Record<string, unknown>), relative(UI, file).replace('.props.ts', ''), raw);
  }
  assert.ok(widgets > 60, `${widgets} widgets`);
  // Values a form cannot type, on purpose: a fixed list of post cards, which
  // the blog's route normally provides, is passed through as it is.
  const expected = ['widgets/blog/Featured.posts[]', 'widgets/blog/PostList.posts[]'];
  assert.deepEqual(raw.filter((r) => !expected.some((e) => r.startsWith(e))), []);
});

test('the widget meta becomes the field\'s input, help and placeholder', async () => {
  const { schema } = await import(join(UI, 'widgets/Hero.props.ts'));
  const f = fieldOf(z.toJSONSchema(schema) as Record<string, unknown>) as Extract<Field, { kind: 'object' }>;
  const byKey = (k: string) => f.properties.find((p) => p.key === k)!;
  assert.equal(byKey('layout').field.kind, 'enum');
  assert.equal(byKey('layout').required, false, 'a defaulted field is optional to the form');
  const actions = byKey('actions').field as Extract<Field, { kind: 'array' }>;
  const action = actions.item as Extract<Field, { kind: 'object' }>;
  assert.equal((action.properties.find((p) => p.key === 'icon')!.field as { input?: string }).input, 'icon');
  assert.equal((action.properties.find((p) => p.key === 'href')!.field as { placeholder?: string }).placeholder, 'https://...');
  const image = byKey('image').field as Extract<Field, { kind: 'object' }>;
  assert.equal((image.properties.find((p) => p.key === 'src')!.field as { input?: string }).input, 'image');
  assert.match(byKey('title').field.help ?? '', /heading/i);
});

test('a value-or-per-period field is a union that knows which variant a value is', async () => {
  const { schema } = await import(join(UI, 'widgets/Pricing.props.ts'));
  const f = fieldOf(z.toJSONSchema(schema) as Record<string, unknown>) as Extract<Field, { kind: 'object' }>;
  const plan = ((f.properties.find((p) => p.key === 'items')!.field as Extract<Field, { kind: 'array' }>).item) as Extract<Field, { kind: 'object' }>;
  const price = plan.properties.find((p) => p.key === 'price')!.field as Extract<Field, { kind: 'union' }>;
  assert.equal(price.kind, 'union');
  assert.deepEqual(price.variants.map((v) => v.label), ['Text', 'One per key']);
  assert.equal(variantOf(price, '29'), 0);
  assert.equal(variantOf(price, { monthly: '29', yearly: '290' }), 1);
  assert.deepEqual(emptyOf(price.variants[1].field), {});
  const level = f.properties.find((p) => p.key === 'level')!.field;
  assert.deepEqual(level.kind === 'enum' && level.options, [1, 2], 'numeric literals are an enum');
});
