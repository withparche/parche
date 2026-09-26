import type { Node } from './node.js';
import { validateTree, type Issue, type WidgetShape } from './validate.js';
import { checkDefinition, checkUses, type JsonWidget } from './json-widgets.js';
import type { ListWrapper } from './wrapper.js';

/**
 * Every structural check a set of trees gets before it renders: the JSON
 * widgets they use (their definitions, their trees from their own root,
 * each use's props), each list's declared wrapper, and the trees against
 * the catalog (slots, allow, counts, depth, wrappers, tones). The renderer
 * runs it on every prerendered page, and the builder on every edit, so both
 * report the same issues with the same paths. Pure: it gets the catalog.
 */
export interface CheckInput {
  /** The trees, each with the path its issues start from (`sections`, `slots.aside`). */
  roots: { nodes: Node[]; base: string }[];
  /** The JSON widgets the trees use, by name, with their trees made ready. */
  definitions: Record<string, JsonWidget>;
  /** Issues found while loading the JSON widgets or preparing their trees. */
  definitionIssues?: Issue[];
  /** The registered widgets' meta (slots, wrapper), from the catalog. */
  widgetMeta: Record<string, WidgetShape | undefined>;
  tones: string[];
  /** The default wrapper widget, whose tone is checked. */
  wrapper: string | null;
  /** The wrappers the lists declare, each with where it was declared. */
  declared?: { path: string; wrapper: ListWrapper | null }[];
}

export function checkTrees(input: CheckInput): Issue[] {
  const { roots, definitions, widgetMeta, tones, wrapper, declared = [], definitionIssues = [] } = input;
  // A JSON widget is a widget with no slots to the validator; its own tree is
  // checked from its root, once, and each use's props against its schema.
  const jsonShapes = Object.fromEntries(Object.values(definitions).map((d) => [d.name, { wrapper: d.wrapper }]));
  const ctx = { widgets: { ...widgetMeta, ...jsonShapes }, tones, wrapper };
  const jsonIssues = [
    ...Object.values(definitions).flatMap((d) => [
      ...(d.name in widgetMeta ? [{ path: `widgets/${d.name}`, message: `"${d.name}" is also a registered widget; rename the JSON one` }] : []),
      ...checkDefinition(d),
      ...validateTree(d.tree, ctx, `widgets/${d.name}.tree`),
    ]),
    ...definitionIssues,
    ...roots.flatMap((r) => checkUses(r.nodes, definitions, r.base)),
  ];
  // A list's wrapper is checked like a node of that widget: it must exist and
  // its tone must be registered.
  const wrapperIssues = declared.flatMap(({ path, wrapper: w }) =>
    w ? validateTree([{ widget: w.name, props: w.props }], { ...ctx, wrapper: w.name }, path).map((i) => ({ ...i, path })) : [],
  );
  return [...jsonIssues, ...wrapperIssues, ...roots.flatMap((r) => validateTree(r.nodes, ctx, r.base))];
}
