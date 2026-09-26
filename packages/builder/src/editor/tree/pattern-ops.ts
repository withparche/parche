import { definePattern, instantiate, parseUse, isPlaceholder, type Node } from '@parche/astro/content/pure';
import { getIn, setIn } from './ops';

/**
 * What the editor does to patterns, as pure edits on documents: make one
 * from a node, turn a use back into its widgets, and give a pattern props by
 * linking the fields of its tree to them. A pattern's `props` is JSON Schema;
 * a linked field holds `{ "$prop": name }`.
 */
type Schema = Record<string, any>;
interface PatternData {
  label?: string;
  props?: { type: 'object'; properties?: Record<string, Schema>; required?: string[] };
  tree: Node[];
  [k: string]: unknown;
}

/** A node as it goes into a file: no editor ids, at any depth. */
export function withoutIds(node: Node): Node {
  const { id: _id, ...rest } = node;
  return {
    ...rest,
    ...(node.slots ? { slots: Object.fromEntries(Object.entries(node.slots).map(([k, kids]) => [k, kids.map(withoutIds)])) } : {}),
  };
}

/** A new pattern holding a copy of these nodes. */
export function patternFrom(nodes: Node[], label: string): PatternData {
  return { label, tree: nodes.map(withoutIds) };
}

/**
 * A use turned back into the widgets it stands for, with the use's values
 * in place and the pattern's defaults applied: a copy the page owns, no
 * longer linked.
 */
export function detach(pattern: { label: string; schema?: unknown; tree: Node[] }, props: Record<string, unknown> | undefined): Node[] {
  const made = definePattern('detached', { label: pattern.label, props: pattern.schema ?? undefined, tree: pattern.tree });
  if (!made.pattern) return pattern.tree.map(withoutIds);
  return instantiate(made.pattern.tree, parseUse(made.pattern, props, '').props).map(withoutIds);
}

/** A prop name from a field's pointer: its last key (`title`, `items`). */
export function propNameFor(pointer: (string | number)[]): string {
  const key = [...pointer].reverse().find((k) => typeof k === 'string') as string | undefined;
  return (key ?? 'value').replace(/[^A-Za-z0-9_]/g, '_');
}

/**
 * Link a field of a node in the pattern's tree to a prop: the field holds
 * `{ "$prop": name }`, and the prop is declared with the field's own schema
 * (so a use gets the same form the widget has) and, when the field had a
 * value, that value as its default — the pattern looks the same until a use
 * says otherwise. Linking to a prop already declared only places it.
 */
export function linkProp(data: PatternData, node: Node, pointer: (string | number)[], name: string, fieldSchema: Schema | null | undefined): void {
  const current = pointer.length ? getIn(node.props ?? {}, pointer) : undefined;
  node.props ??= {};
  setIn(node.props, pointer, { $prop: name });
  data.props ??= { type: 'object', properties: {} };
  data.props.type = 'object';
  data.props.properties ??= {};
  if (!data.props.properties[name]) {
    const { default: _d, ...schema } = (fieldSchema ?? {}) as Schema;
    data.props.properties[name] = { ...schema, ...(current !== undefined && !isPlaceholder(current) ? { default: current } : _d !== undefined ? { default: _d } : {}) };
  }
}

/** Every placeholder in a tree, with the node and the pointer inside its props. */
export function placeholdersIn(tree: Node[]): { node: Node; pointer: (string | number)[]; prop: string }[] {
  const out: { node: Node; pointer: (string | number)[]; prop: string }[] = [];
  const walk = (node: Node, v: unknown, at: (string | number)[]) => {
    if (isPlaceholder(v)) out.push({ node, pointer: at, prop: v.$prop });
    else if (Array.isArray(v)) v.forEach((x, i) => walk(node, x, [...at, i]));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(node, x, [...at, k]);
  };
  const visit = (nodes: Node[]) => {
    for (const n of nodes) {
      walk(n, n.props, []);
      for (const kids of Object.values(n.slots ?? {})) visit(kids);
    }
  };
  visit(tree);
  return out;
}

/**
 * Unlink a field: it gets back a fixed value — the prop's default when it
 * has one, else nothing. A prop no field uses any more is no longer declared.
 */
export function unlinkProp(data: PatternData, node: Node, pointer: (string | number)[]): void {
  const v = getIn(node.props ?? {}, pointer);
  if (!isPlaceholder(v)) return;
  const name = v.$prop.split('.')[0];
  const schema = data.props?.properties?.[name];
  setIn(node.props ?? {}, pointer, v.$prop === name ? schema?.default : undefined);
  if (!placeholdersIn(data.tree).some((p) => p.prop.split('.')[0] === name)) removeDeclaration(data, name);
}

function removeDeclaration(data: PatternData, name: string) {
  if (!data.props?.properties) return;
  delete data.props.properties[name];
  if (data.props.required) {
    data.props.required = data.props.required.filter((r) => r !== name);
    if (!data.props.required.length) delete data.props.required;
  }
  if (!Object.keys(data.props.properties).length) delete data.props;
}

/** Rename a prop: its declaration, whether it is required, and every placeholder that names it. */
export function renameProp(data: PatternData, from: string, to: string): void {
  const props = data.props?.properties;
  if (!props?.[from] || from === to || props[to]) return;
  data.props!.properties = Object.fromEntries(Object.entries(props).map(([k, v]) => [k === from ? to : k, v]));
  if (data.props!.required) data.props!.required = data.props!.required.map((r) => (r === from ? to : r));
  for (const p of placeholdersIn(data.tree)) {
    const [root, ...rest] = p.prop.split('.');
    if (root === from) setIn(p.node.props!, p.pointer, { $prop: [to, ...rest].join('.') });
  }
}

/** Remove a prop: every field linked to it gets back its default (or nothing), and the declaration goes. */
export function removeProp(data: PatternData, name: string): void {
  for (const p of placeholdersIn(data.tree)) if (p.prop.split('.')[0] === name) unlinkProp(data, p.node, p.pointer);
  removeDeclaration(data, name);
}

/** Whether a use must give a prop. */
export function setRequired(data: PatternData, name: string, required: boolean): void {
  if (!data.props) return;
  const list = new Set(data.props.required ?? []);
  if (required) list.add(name);
  else list.delete(name);
  if (list.size) data.props.required = [...list];
  else delete data.props.required;
}
