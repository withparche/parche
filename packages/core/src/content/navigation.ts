import type { Node } from './node.js';

/**
 * The pure half of menu references (the collection lookup is in
 * utils/navigation.ts): find `{ "$navigation": name }` values in a tree's
 * props and replace them by the menu's items.
 */

/** A menu a tree points at that the collection does not have, with where. */
export interface MissingMenu {
  path: string;
  name: string;
}

const isRef = (v: unknown): v is { $navigation: string } =>
  !!v && typeof v === 'object' && !Array.isArray(v) && typeof (v as any).$navigation === 'string' && Object.keys(v as object).length === 1;

/** Whether anything in the value is a menu reference. */
export function hasNavigationRef(v: unknown): boolean {
  if (isRef(v)) return true;
  if (Array.isArray(v)) return v.some(hasNavigationRef);
  if (v && typeof v === 'object') return Object.values(v).some(hasNavigationRef);
  return false;
}

/**
 * Replace every reference in the nodes' props (at any depth, in every slot) by
 * `find(name)`. A name `find` does not know becomes an empty list and is
 * reported with its path, so the page renders and the build can fail on it.
 */
export function substituteNavigation(
  nodes: Node[],
  find: (name: string) => unknown[] | undefined,
  base = 'sections',
): { nodes: Node[]; missing: MissingMenu[] } {
  const missing: MissingMenu[] = [];
  const value = (v: unknown, path: string): unknown => {
    if (isRef(v)) {
      const items = find(v.$navigation);
      if (!items) missing.push({ path, name: v.$navigation });
      return items ?? [];
    }
    if (Array.isArray(v)) return v.map((x, i) => value(x, `${path}[${i}]`));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, value(x, `${path}.${k}`)]));
    return v;
  };
  const node = (n: Node, path: string): Node => ({
    ...n,
    ...(n.props ? { props: value(n.props, `${path}.props`) as Record<string, unknown> } : {}),
    ...(n.slots
      ? { slots: Object.fromEntries(Object.entries(n.slots).map(([name, list]) => [name, list.map((c, i) => node(c, `${path}.slots.${name}[${i}]`))])) }
      : {}),
  });
  return { nodes: nodes.map((n, i) => node(n, `${base}[${i}]`)), missing };
}
