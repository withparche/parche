import type { Node } from '@parche/astro/content/pure';
import { rootsOf, type Kind } from '../../shared/roots';

/**
 * Where a node sits: its list, its index there, its parent (and the slot)
 * or the root list, its depth (0 for a root item) and its path as the
 * validator writes paths (`sections[2].slots.media[0]`).
 */
export interface Location {
  node: Node;
  list: Node[];
  index: number;
  parent: { node: Node; slot: string } | null;
  root: string;
  depth: number;
  path: string;
}

export function* locations(kind: Kind, data: Record<string, any>): Generator<Location> {
  function* walk(list: Node[], base: string, root: string, parent: Location['parent'], depth: number): Generator<Location> {
    for (const [index, node] of list.entries()) {
      const path = `${base}[${index}]`;
      yield { node, list, index, parent, root, depth, path };
      for (const [slot, kids] of Object.entries(node.slots ?? {})) {
        if (Array.isArray(kids)) yield* walk(kids, `${path}.slots.${slot}`, root, { node, slot }, depth + 1);
      }
    }
  }
  for (const r of rootsOf(kind, data)) yield* walk(r.nodes, r.base, r.base, null, 0);
}

export function locate(kind: Kind, data: Record<string, any>, id: string): Location | null {
  for (const l of locations(kind, data)) if (l.node.id === id) return l;
  return null;
}

/** The node an issue's path points into (the deepest node on it), for selecting it. */
export function nodeAtPath(kind: Kind, data: Record<string, any>, path: string): string | null {
  let best: { id: string; len: number } | null = null;
  for (const l of locations(kind, data)) {
    if ((path === l.path || path.startsWith(`${l.path}.`)) && l.node.id && (!best || l.path.length > best.len)) best = { id: l.node.id, len: l.path.length };
  }
  return best?.id ?? null;
}

/** How many levels a subtree adds below its root (a leaf adds 0). */
export function height(node: Node): number {
  let h = 0;
  for (const kids of Object.values(node.slots ?? {})) if (Array.isArray(kids)) for (const k of kids) h = Math.max(h, 1 + height(k));
  return h;
}

export function contains(node: Node, id: string): boolean {
  if (node.id === id) return true;
  return Object.values(node.slots ?? {}).some((kids) => Array.isArray(kids) && kids.some((k) => contains(k, id)));
}
