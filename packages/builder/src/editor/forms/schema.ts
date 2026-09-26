/**
 * A widget's props as fields, from the JSON Schema core emits for it
 * (z.toJSONSchema over the widget's `.props.ts`). The meta a widget writes
 * with `.meta()` rides on each property: `help`, `placeholder`, `input`
 * (textarea, icon, url, image, tone) and `markdown: 'inline'`. Pure: the
 * form components render what this returns.
 */
export type JsonSchema = Record<string, any>;

interface Common {
  label: string;
  help?: string;
  default?: unknown;
  schema: JsonSchema;
}

export type Field = Common &
  (
    | { kind: 'text'; input?: 'textarea' | 'icon' | 'url' | 'image' | 'tone' | 'color' | 'date'; markdown?: boolean; placeholder?: string }
    | { kind: 'number'; integer: boolean; min?: number; max?: number }
    | { kind: 'boolean' }
    | { kind: 'enum'; options: (string | number | boolean)[] }
    | { kind: 'const'; value: unknown }
    | { kind: 'object'; properties: { key: string; field: Field; required: boolean }[] }
    | { kind: 'array'; item: Field; minItems?: number; maxItems?: number }
    | { kind: 'record'; value: Field }
    | { kind: 'union'; variants: { label: string; field: Field }[] }
    | { kind: 'json' }
  );

export function humanize(key: string): string {
  const words = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase();
}

function deref(schema: JsonSchema, root: JsonSchema, seen: Set<string>): JsonSchema {
  const ref = schema?.$ref as string | undefined;
  if (!ref || !ref.startsWith('#/')) return schema;
  if (seen.has(ref)) return {};
  seen.add(ref);
  const target = ref.slice(2).split('/').reduce<any>((o, k) => o?.[k], root);
  return deref({ ...target, ...Object.fromEntries(Object.entries(schema).filter(([k]) => k !== '$ref')) }, root, seen);
}

const typeOf = (s: JsonSchema): string | undefined => (Array.isArray(s.type) ? s.type.find((t: string) => t !== 'null') : s.type);

export function fieldOf(input: JsonSchema, key = '', root: JsonSchema = input, seen: Set<string> = new Set()): Field {
  const schema = deref(input ?? {}, root, new Set(seen));
  const common: Common = { label: schema.label ?? humanize(key), help: schema.help ?? schema.description, default: schema.default, schema };

  if ('const' in schema) return { ...common, kind: 'const', value: schema.const };
  if (Array.isArray(schema.enum)) return { ...common, kind: 'enum', options: schema.enum };

  const branches: JsonSchema[] | undefined = schema.anyOf ?? schema.oneOf;
  if (branches) {
    const real = branches.map((b) => deref(b, root, new Set(seen))).filter((b) => typeOf(b) !== 'null');
    if (real.length && real.every((b) => 'const' in b)) return { ...common, kind: 'enum', options: real.map((b) => b.const) };
    if (real.length === 1) return { ...fieldOf({ ...real[0], ...pick(schema) }, key, root, seen), default: schema.default };
    return { ...common, kind: 'union', variants: real.map((b) => ({ label: variantLabel(b), field: fieldOf({ ...b, ...pick(schema, true) }, key, root, seen) })) };
  }

  switch (typeOf(schema)) {
    case 'string': {
      const input = schema.input ?? (schema.format === 'date' || schema.format === 'date-time' ? 'date' : undefined);
      return { ...common, kind: 'text', input, markdown: schema.markdown === 'inline', placeholder: schema.placeholder };
    }
    case 'number':
    case 'integer':
      return { ...common, kind: 'number', integer: typeOf(schema) === 'integer', min: schema.minimum, max: schema.maximum };
    case 'boolean':
      return { ...common, kind: 'boolean' };
    case 'array':
      return { ...common, kind: 'array', item: fieldOf(schema.items ?? {}, singular(key), root, seen), minItems: schema.minItems, maxItems: schema.maxItems };
    case 'object': {
      if (schema.properties) {
        const required = new Set<string>(schema.required ?? []);
        return {
          ...common,
          kind: 'object',
          properties: Object.entries(schema.properties as Record<string, JsonSchema>).map(([k, s]) => ({ key: k, field: fieldOf(s, k, root, seen), required: required.has(k) && !('default' in s) })),
        };
      }
      if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        return { ...common, kind: 'record', value: fieldOf(schema.additionalProperties, 'value', root, seen) };
      }
      return { ...common, kind: 'json' };
    }
  }
  return { ...common, kind: 'json' };
}

/** The meta a union carries for all its branches (help, label), so each branch shows it. */
function pick(schema: JsonSchema, withoutDefault = false): JsonSchema {
  const out: JsonSchema = {};
  for (const k of ['help', 'label', 'description', 'placeholder', 'input', 'markdown', 'default']) {
    if (k in schema && !(withoutDefault && k === 'default')) out[k] = schema[k];
  }
  return out;
}

function variantLabel(s: JsonSchema): string {
  const t = typeOf(s);
  if (t === 'object') return s.properties ? 'Fields' : 'One per key';
  if (t === 'array') return 'List';
  if (t === 'string') return 'Text';
  if (t === 'number' || t === 'integer') return 'Number';
  if (t === 'boolean') return 'Yes or no';
  return 'Value';
}

const singular = (key: string) => (key.endsWith('ies') ? key.slice(0, -3) + 'y' : key.endsWith('s') ? key.slice(0, -1) : key || 'item');

/** Which of a union's variants a value is. */
export function variantOf(field: Extract<Field, { kind: 'union' }>, value: unknown): number {
  const i = field.variants.findIndex((v) => fits(v.field, value));
  return i === -1 ? 0 : i;
}

export function fits(field: Field, value: unknown): boolean {
  if (value === undefined) return false;
  switch (field.kind) {
    case 'text':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'enum':
      return field.options.includes(value as never);
    case 'array':
      return Array.isArray(value);
    case 'object':
      return !!value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every((k) => field.properties.some((p) => p.key === k));
    case 'record':
      return !!value && typeof value === 'object' && !Array.isArray(value);
    default:
      return true;
  }
}

/** An empty value of a field's shape, for a new array item or a switched variant. */
export function emptyOf(field: Field): unknown {
  if (field.default !== undefined) return structuredClone(field.default);
  switch (field.kind) {
    case 'text':
      return '';
    case 'number':
      return field.min ?? 0;
    case 'boolean':
      return false;
    case 'enum':
      return field.options[0];
    case 'const':
      return field.value;
    case 'array':
      return [];
    case 'record':
      return {};
    case 'union':
      return emptyOf(field.variants[0].field);
    case 'object':
      return Object.fromEntries(field.properties.filter((p) => p.required).map((p) => [p.key, emptyOf(p.field)]));
    default:
      return {};
  }
}
