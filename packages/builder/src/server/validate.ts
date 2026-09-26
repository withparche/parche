import type { ZodType } from 'zod';
import { checkTrees, listWrapper, outletWrappers, usedJsonWidgets, type JsonWidget, type ListWrapper, type Node, type WidgetShape } from '@parche/astro/content/pure';

/**
 * Everything the builder checks before a document is saved, with the paths
 * the renderer uses (`sections[2].slots.media[0].props.items[0].price`):
 *
 * 1. the collection's schema, which the content layer would refuse;
 * 2. the trees against the catalog, as a prerendered page checks them;
 * 3. references that point nowhere;
 * 4. each widget's props against its zod schema, the way the widget itself
 *    will parse them — refinements included, which a JSON Schema loses.
 *
 * Pure over the context it is given; the API route builds that context from
 * the site's virtual modules and core's resolvers.
 */

export interface ValidationIssue {
  path: string;
  message: string;
  severity: 'error' | 'warning';
  source: 'schema' | 'tree' | 'ref' | 'props';
}

export interface ValidationContext {
  widgetMeta: Record<string, WidgetShape | undefined>;
  widgetPropSchemas: Record<string, ZodType>;
  tones: string[];
  wrapper: string | null;
  /** The site's JSON widgets, by name. */
  definitions: Record<string, JsonWidget>;
  /** The collection's schema, when there is one to check against. */
  collectionSchema?: ZodType;
  /** Resolves `$ref` / `$collection` values as a page does; without one, nodes holding references skip the props check. */
  resolveRefs?: (nodes: Node[], base: string) => Promise<{ nodes: Node[]; issues: { path: string; message: string }[] }>;
  /** Builds a JSON widget from a `widgets` document, to check the definition being edited. */
  defineJsonWidget?: (name: string, data: unknown) => { widget?: JsonWidget; error?: string };
}

export { kindOf, rootsOf } from '../shared/roots.js';
import { kindOf, rootsOf } from '../shared/roots.js';

/** Every node of some roots with its path. */
export function* nodesWithPaths(roots: { nodes: Node[]; base: string }[]): Generator<{ node: Node; path: string }> {
  function* walk(nodes: Node[], base: string): Generator<{ node: Node; path: string }> {
    for (const [i, node] of nodes.entries()) {
      const path = `${base}[${i}]`;
      yield { node, path };
      for (const [slot, kids] of Object.entries(node.slots ?? {})) if (Array.isArray(kids)) yield* walk(kids, `${path}.slots.${slot}`);
    }
  }
  for (const r of roots) yield* walk(r.nodes, r.base);
}

const zodPath = (segments: PropertyKey[]) => segments.map((s) => (typeof s === 'number' ? `[${s}]` : `.${String(s)}`)).join('');

/** A value a props check cannot judge: a JSON widget's `$prop`, a view's `$label`. */
function hasPlaceholder(v: unknown): boolean {
  if (Array.isArray(v)) return v.some(hasPlaceholder);
  if (v && typeof v === 'object') {
    if ('$prop' in v || '$label' in v) return true;
    return Object.values(v).some(hasPlaceholder);
  }
  return false;
}
function hasRef(v: unknown): boolean {
  if (Array.isArray(v)) return v.some(hasRef);
  if (v && typeof v === 'object') return '$ref' in v || '$collection' in v || Object.values(v).some(hasRef);
  return false;
}

export async function validateDoc(collection: string, data: Record<string, any>, ctx: ValidationContext, id = ''): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  const kind = kindOf(collection);

  if (ctx.collectionSchema) {
    const parsed = ctx.collectionSchema.safeParse(data);
    if (!parsed.success) {
      for (const i of parsed.error.issues) issues.push({ path: zodPath(i.path).replace(/^\./, '') || '(document)', message: i.message, severity: 'error', source: 'schema' });
    }
  }

  let roots = rootsOf(kind, data);
  let definitions = ctx.definitions;
  if (kind === 'widget') {
    const made = ctx.defineJsonWidget?.(id, data);
    if (made?.error) issues.push({ path: '(document)', message: made.error, severity: 'error', source: 'schema' });
    // The definition checks its own tree; its $prop placeholders are not uses.
    definitions = made?.widget ? { ...ctx.definitions, [id]: made.widget } : ctx.definitions;
    roots = [];
  }

  const declared: { path: string; wrapper: ListWrapper | null }[] = [];
  if ((kind === 'page' || kind === 'view') && data.wrapper !== undefined) declared.push({ path: 'wrapper', wrapper: listWrapper(data.wrapper, ctx.wrapper) });
  if (kind === 'layout') {
    for (const o of outletWrappers(roots[0]?.nodes ?? [])) {
      declared.push({ path: o.path.replace(/^layout/, 'sections') + '.props.wrapper', wrapper: listWrapper(o.spec, ctx.wrapper) });
    }
  }

  // As the renderer does: only the JSON widgets this document uses are checked.
  const used = kind === 'widget' ? { [id]: definitions[id] } : Object.fromEntries([...usedJsonWidgets(roots.flatMap((r) => r.nodes), definitions)].map((n) => [n, definitions[n]]));
  for (const i of checkTrees({ roots, definitions: Object.fromEntries(Object.entries(used).filter(([, d]) => d)), widgetMeta: ctx.widgetMeta, tones: ctx.tones, wrapper: ctx.wrapper, declared })) {
    issues.push({ path: i.path, message: i.message, severity: 'error', source: 'tree' });
  }

  // References, then each widget's props as the widget will parse them.
  let resolvedRoots = roots;
  if (ctx.resolveRefs) {
    resolvedRoots = [];
    for (const r of roots) {
      const res = await ctx.resolveRefs(r.nodes, r.base);
      for (const i of res.issues) issues.push({ path: i.path, message: i.message, severity: 'error', source: 'ref' });
      resolvedRoots.push({ nodes: res.nodes, base: r.base });
    }
  }
  for (const { node, path } of nodesWithPaths(resolvedRoots)) {
    const check = (widget: string | undefined, props: unknown, at: string) => {
      const schema = widget ? ctx.widgetPropSchemas[widget] : undefined;
      if (!schema || hasPlaceholder(props) || (!ctx.resolveRefs && hasRef(props))) return;
      const parsed = schema.safeParse(props ?? {});
      if (!parsed.success) for (const i of parsed.error.issues) issues.push({ path: `${at}${zodPath(i.path)}`, message: i.message, severity: 'error', source: 'props' });
    };
    check(node.widget, node.props, `${path}.props`);
    if (node.wrapper && typeof node.wrapper === 'object') check(node.wrapper.widget ?? ctx.wrapper ?? undefined, node.wrapper.props, `${path}.wrapper.props`);
  }
  return issues;
}
