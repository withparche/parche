import { z } from 'zod';
import { nodeSchema, type Node } from './node.js';

/**
 * Widgets defined in JSON: a composition of registered widgets with props of
 * its own, kept in the `widgets` collection (`src/content/widgets/<Name>.json`)
 * and used by name like any widget:
 *
 *   { "widget": "TourStep", "props": { "title": "One file for the whole site" } }
 *
 * The definition declares its props as JSON Schema, which becomes a zod schema
 * through `z.fromJSONSchema`: every use is validated against it, with its
 * defaults applied, and unknown props are reported. Inside the tree, a value
 * `{ "$prop": "title" }` takes the prop's value (a dotted path reaches into an
 * object prop). A placeholder whose prop is not given drops its key, so the
 * inner widget's own default applies.
 *
 * The tree is validated from its own root: a use counts as one node where it
 * sits, which is what lets a composition stay within the depth limit.
 */

const jsonSchemaObject = z
  .object({
    type: z.literal('object'),
    properties: z.record(z.string(), z.record(z.string(), z.unknown())).default({}),
    required: z.array(z.string()).optional(),
  })
  .passthrough();

export const widgetDefinitionSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  icon: z.string().optional(),
  /** false when a use is never wrapped, like a widget whose meta says `wrapper: false`. */
  wrapper: z.boolean().default(true),
  props: jsonSchemaObject.default({ type: 'object', properties: {} }),
  tree: z.array(nodeSchema).min(1),
});

export type WidgetDefinition = z.infer<typeof widgetDefinitionSchema>;

/** A definition ready to render: its name and its props as zod. */
export interface JsonWidget extends WidgetDefinition {
  name: string;
  schema: z.ZodType;
}

export interface Placeholder {
  $prop: string;
}

export function isPlaceholder(value: unknown): value is Placeholder {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).length === 1 &&
    typeof (value as Placeholder).$prop === 'string'
  );
}

/**
 * The definition's props as zod. Unknown props are refused unless the schema
 * says otherwise (`additionalProperties`), so a misspelt prop is reported
 * instead of silently ignored.
 */
export function compileProps(props: WidgetDefinition['props']): z.ZodType {
  const schema = { additionalProperties: false, ...props } as Parameters<typeof z.fromJSONSchema>[0];
  return z.fromJSONSchema(schema);
}

/** Builds a JsonWidget from a collection entry, or explains why it cannot. */
export function defineJsonWidget(name: string, data: unknown): { widget?: JsonWidget; error?: string } {
  const parsed = widgetDefinitionSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => `${i.path.join('.') || 'definition'}: ${i.message}`).join('; ') };
  try {
    return { widget: { ...parsed.data, name, schema: compileProps(parsed.data.props) } };
  } catch (e) {
    return { error: `props: not a JSON Schema zod can read (${(e as Error).message})` };
  }
}

function get(obj: unknown, path: string): unknown {
  let cur: any = obj;
  for (const key of path.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[key];
  }
  return cur;
}

const DROP = Symbol('drop');

function substitute(value: unknown, props: Record<string, unknown>): unknown {
  if (isPlaceholder(value)) {
    const v = get(props, value.$prop);
    return v === undefined ? DROP : v;
  }
  if (Array.isArray(value)) return value.map((v) => substitute(v, props)).filter((v) => v !== DROP);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const s = substitute(v, props);
      if (s !== DROP) out[k] = s;
    }
    return out;
  }
  return value;
}

/** The definition's tree with every placeholder replaced by the given props. */
export function instantiate(tree: Node[], props: Record<string, unknown>): Node[] {
  return tree.map((node) => ({
    ...node,
    ...(node.props ? { props: substitute(node.props, props) as Record<string, unknown> } : {}),
    ...(node.wrapper && node.wrapper.props ? { wrapper: { ...node.wrapper, props: substitute(node.wrapper.props, props) as Record<string, unknown> } } : {}),
    ...(node.slots
      ? { slots: Object.fromEntries(Object.entries(node.slots).map(([slot, kids]) => [slot, instantiate(kids, props)])) }
      : {}),
  }));
}

/** Every `$prop` path a tree uses, with where it sits. */
export function placeholders(tree: Node[], base = 'tree'): { prop: string; path: string }[] {
  const out: { prop: string; path: string }[] = [];
  const walk = (value: unknown, path: string) => {
    if (isPlaceholder(value)) out.push({ prop: value.$prop, path });
    else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`));
    else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
  };
  tree.forEach((node, i) => {
    const at = `${base}[${i}]`;
    walk(node.props, `${at}.props`);
    if (node.wrapper && node.wrapper.props) walk(node.wrapper.props, `${at}.wrapper.props`);
    for (const [slot, kids] of Object.entries(node.slots ?? {})) out.push(...placeholders(kids, `${at}.slots.${slot}`));
  });
  return out;
}

export interface Issue {
  path: string;
  message: string;
}

/**
 * Checks a definition against itself: every placeholder names a declared
 * prop, and every declared prop is used somewhere in the tree.
 */
export function checkDefinition(widget: JsonWidget, base = `widgets/${widget.name}`): Issue[] {
  const issues: Issue[] = [];
  const declared = Object.keys(widget.props.properties ?? {});
  const used = placeholders(widget.tree, `${base}.tree`);
  for (const { prop, path } of used) {
    const root = prop.split('.')[0];
    if (!declared.includes(root)) issues.push({ path, message: `{ "$prop": "${prop}" } names a prop the definition does not declare (declared: ${declared.join(', ') || 'none'})` });
  }
  const roots = new Set(used.map((u) => u.prop.split('.')[0]));
  for (const name of declared) {
    if (!roots.has(name)) issues.push({ path: `${base}.props.properties.${name}`, message: `"${name}" is declared but no { "$prop" } uses it` });
  }
  return issues;
}

/** Parses a use's props: the values with defaults applied, or the issues at the use's path. */
export function parseUse(widget: JsonWidget, props: unknown, path: string): { props: Record<string, unknown>; issues: Issue[] } {
  const res = widget.schema.safeParse(props ?? {});
  if (res.success) return { props: res.data as Record<string, unknown>, issues: [] };
  return {
    props: (props ?? {}) as Record<string, unknown>,
    issues: res.error.issues.map((i) => ({ path: `${path}.props${i.path.length ? '.' + i.path.join('.') : ''}`, message: i.message })),
  };
}

const MAX_NESTING = 3;

/**
 * Walks trees for uses of JSON widgets: validates each use's props, then the
 * tree it expands to, with its real values, for the uses inside it. Returns
 * the issues, with paths through the use (`sections[1].slots.config[0]>TourStep.tree[0]`).
 */
export function checkUses(nodes: Node[], widgets: Record<string, JsonWidget>, base = 'sections', nesting = 0): Issue[] {
  const issues: Issue[] = [];
  nodes.forEach((node, i) => {
    const path = `${base}[${i}]`;
    const def = widgets[node.widget];
    if (def) {
      const use = parseUse(def, node.props, path);
      issues.push(...use.issues);
      if (nesting >= MAX_NESTING) issues.push({ path, message: `"${node.widget}" nests JSON widgets more than ${MAX_NESTING} deep` });
      else issues.push(...checkUses(instantiate(def.tree, use.props), widgets, `${path}>${def.name}.tree`, nesting + 1));
    }
    for (const [slot, kids] of Object.entries(node.slots ?? {})) issues.push(...checkUses(kids, widgets, `${path}.slots.${slot}`, nesting));
  });
  return issues;
}

/** The JSON widgets a tree uses, including those inside their trees. */
export function usedJsonWidgets(nodes: Node[], widgets: Record<string, JsonWidget>, seen = new Set<string>()): Set<string> {
  const visit = (list: Node[]) => {
    for (const node of list) {
      const def = widgets[node.widget];
      if (def && !seen.has(def.name)) {
        seen.add(def.name);
        visit(def.tree);
      }
      for (const kids of Object.values(node.slots ?? {})) visit(kids);
    }
  };
  visit(nodes);
  return seen;
}
