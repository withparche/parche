import { z } from 'zod';
import { nodeSchema, type Node } from './node.js';

/**
 * Patterns: compositions of widgets kept once, in the `patterns` collection
 * (`src/content/patterns/<id>.json`, or `<locale>/<id>.json` for content
 * that is written per language), and used by id wherever a widget goes:
 *
 *   { "widget": "pattern/faq-agencies" }
 *   { "widget": "pattern/tour-step", "props": { "title": "One file for the whole site" } }
 *
 * A pattern serves two purposes with one shape. Without `props` it is
 * content shared as it is: the same FAQ on several pages, changed once. With
 * `props` it is an abstraction: its tree is fixed, and each use gives only the
 * values, which `{ "$prop": "title" }` placeholders put where they belong (a
 * dotted path reaches into an object prop). A placeholder whose prop is not
 * given drops its key, so the inner widget's own default applies.
 *
 * `props` is JSON Schema, which becomes zod through `z.fromJSONSchema`: every
 * use is validated against it, with its defaults applied, and a prop the
 * pattern does not declare is reported — a pattern without `props` takes none.
 *
 * A use stands for the pattern's roots: in a list they are items of that
 * list, wrapped (or not) as if written there. The id is looked up in the
 * page's locale first (`en/faq-agencies`), then as written (`faq-agencies`).
 * A pattern may use another; one that reaches itself is reported and not
 * rendered.
 */

/** The prefix that names a pattern where a widget goes. */
export const PATTERN_PREFIX = 'pattern/';

export const isPatternUse = (widget: string) => widget.startsWith(PATTERN_PREFIX);

const jsonSchemaObject = z
  .object({
    type: z.literal('object'),
    properties: z.record(z.string(), z.record(z.string(), z.unknown())).default({}),
    required: z.array(z.string()).optional(),
  })
  .passthrough();

export const patternSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  icon: z.string().optional(),
  props: jsonSchemaObject.default({ type: 'object', properties: {} }),
  tree: z.array(nodeSchema).min(1),
});

export type PatternEntry = z.infer<typeof patternSchema>;

/** A pattern ready to render: the name it is used by, its entry, and its props as zod. */
export interface Pattern extends PatternEntry {
  /** As used: `pattern/tour-step`. */
  name: string;
  /** The collection entry it comes from: `tour-step`, `en/faq-agencies`. */
  entry: string;
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
 * The pattern's props as zod. Unknown props are refused unless the schema
 * says otherwise (`additionalProperties`), so a misspelt prop is reported
 * instead of silently ignored.
 */
export function compileProps(props: PatternEntry['props']): z.ZodType {
  const schema = { additionalProperties: false, ...props } as Parameters<typeof z.fromJSONSchema>[0];
  return z.fromJSONSchema(schema);
}

/** Builds a Pattern from a collection entry, or explains why it cannot. */
export function definePattern(entry: string, data: unknown, name = PATTERN_PREFIX + entry): { pattern?: Pattern; error?: string } {
  const parsed = patternSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => `${i.path.join('.') || 'pattern'}: ${i.message}`).join('; ') };
  try {
    return { pattern: { ...parsed.data, name, entry, schema: compileProps(parsed.data.props) } };
  } catch (e) {
    return { error: `props: not a JSON Schema zod can read (${(e as Error).message})` };
  }
}

/**
 * The patterns a page in `locale` can use, by the name it uses them with:
 * `pattern/faq` is the locale's `en/faq` when there is one, else `faq`.
 */
export function patternsFor<T extends { entry: string }>(entries: T[], locale?: string): Record<string, T> {
  const out: Record<string, T> = {};
  for (const p of entries) out[PATTERN_PREFIX + p.entry] ??= p;
  if (locale) for (const p of entries) if (p.entry.startsWith(`${locale}/`)) out[PATTERN_PREFIX + p.entry.slice(locale.length + 1)] = p;
  return out;
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

/** The pattern's tree with every placeholder replaced by the given props. */
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
 * Checks a pattern against itself: every placeholder names a declared prop,
 * and every declared prop is used somewhere in the tree.
 */
export function checkDefinition(pattern: Pattern, base = `patterns/${pattern.entry}`): Issue[] {
  const issues: Issue[] = [];
  const declared = Object.keys(pattern.props.properties ?? {});
  const used = placeholders(pattern.tree, `${base}.tree`);
  for (const { prop, path } of used) {
    const root = prop.split('.')[0];
    if (!declared.includes(root)) issues.push({ path, message: `{ "$prop": "${prop}" } names a prop the pattern does not declare (declared: ${declared.join(', ') || 'none'})` });
  }
  const roots = new Set(used.map((u) => u.prop.split('.')[0]));
  for (const name of declared) {
    if (!roots.has(name)) issues.push({ path: `${base}.props.properties.${name}`, message: `"${name}" is declared but no { "$prop" } uses it` });
  }
  return issues;
}

/** Parses a use's props: the values with defaults applied, or the issues at the use's path. */
export function parseUse(pattern: Pattern, props: unknown, path: string): { props: Record<string, unknown>; issues: Issue[] } {
  const res = pattern.schema.safeParse(props ?? {});
  if (res.success) return { props: res.data as Record<string, unknown>, issues: [] };
  return {
    props: (props ?? {}) as Record<string, unknown>,
    issues: res.error.issues.map((i) => ({ path: `${path}.props${i.path.length ? '.' + i.path.join('.') : ''}`, message: i.message })),
  };
}

/**
 * Walks trees for uses of patterns: an unknown one, each use's props, then
 * the tree it expands to, with its real values, for the uses inside it. A
 * pattern that reaches itself is reported once, where the loop closes.
 * Paths go through the use (`sections[1].slots.config[0]>pattern/tour-step.tree[0]`).
 */
export function checkUses(nodes: Node[], patterns: Record<string, Pattern>, base = 'sections', chain: string[] = []): Issue[] {
  const issues: Issue[] = [];
  nodes.forEach((node, i) => {
    const path = `${base}[${i}]`;
    if (isPatternUse(node.widget)) {
      const def = patterns[node.widget];
      if (!def) issues.push({ path, message: `no pattern "${node.widget.slice(PATTERN_PREFIX.length)}" in src/content/patterns` });
      else if (chain.includes(def.name)) issues.push({ path, message: `"${def.name}" uses itself (${[...chain, def.name].join(' > ')})` });
      else {
        const use = parseUse(def, node.props, path);
        issues.push(...use.issues);
        issues.push(...checkUses(instantiate(def.tree, use.props), patterns, `${path}>${def.name}.tree`, [...chain, def.name]));
      }
    }
    for (const [slot, kids] of Object.entries(node.slots ?? {})) issues.push(...checkUses(kids, patterns, `${path}.slots.${slot}`, chain));
  });
  return issues;
}

/** The patterns a tree uses, including those inside their trees. */
export function usedPatterns(nodes: Node[], patterns: Record<string, Pattern>, seen = new Set<string>()): Set<string> {
  const visit = (list: Node[]) => {
    for (const node of list) {
      const def = patterns[node.widget];
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

/**
 * The widgets a pattern stands for where it is used: its roots, through the
 * patterns among them. A slot that allows only some widgets takes a pattern
 * when every root is one of those.
 */
export function rootWidgets(name: string, patterns: Record<string, Pick<Pattern, 'tree'> | undefined>, seen: string[] = []): string[] {
  const def = patterns[name];
  if (!def || seen.includes(name)) return [name];
  return def.tree.flatMap((n) => (patterns[n.widget] ? rootWidgets(n.widget, patterns, [...seen, name]) : [n.widget]));
}
