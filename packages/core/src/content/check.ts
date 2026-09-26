import type { Node } from './node.js';
import { validateTree, type Issue, type WidgetShape } from './validate.js';
import { checkDefinition, checkUses, type Pattern } from './patterns.js';
import type { ListWrapper } from './wrapper.js';

/**
 * Every structural check a set of trees gets before it renders: the
 * patterns they use (each pattern against itself, its tree from its own
 * root, each use's props), each list's declared wrapper, and the trees
 * against the catalog (slots, allow, counts, wrappers, tones). The renderer
 * runs it on every prerendered page, and the builder on every edit, so both
 * report the same issues with the same paths. Pure: it gets the catalog.
 */
export interface CheckInput {
  /** The trees, each with the path its issues start from (`sections`, `slots.aside`). */
  roots: { nodes: Node[]; base: string }[];
  /** The patterns the trees can use, by the name they use them with, their trees made ready. */
  definitions: Record<string, Pattern>;
  /** Issues found while loading the patterns or preparing their trees. */
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
  // A pattern's tree is checked from its root, once, and each use's props
  // against its schema; where it is used, it stands for its roots.
  const ctx = { widgets: widgetMeta, tones, wrapper, patterns: definitions };
  const patternIssues = [
    ...Object.values(definitions).flatMap((d) => [...checkDefinition(d), ...validateTree(d.tree, ctx, `patterns/${d.entry}.tree`)]),
    ...definitionIssues,
    ...roots.flatMap((r) => checkUses(r.nodes, definitions, r.base)),
  ];
  // A list's wrapper is checked like a node of that widget: it must exist and
  // its tone must be registered.
  const wrapperIssues = declared.flatMap(({ path, wrapper: w }) =>
    w ? validateTree([{ widget: w.name, props: w.props }], { ...ctx, wrapper: w.name }, path).map((i) => ({ ...i, path })) : [],
  );
  return [...patternIssues, ...wrapperIssues, ...roots.flatMap((r) => validateTree(r.nodes, ctx, r.base))];
}
