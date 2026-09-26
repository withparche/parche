import { MAX_NODE_DEPTH, type Node } from '@parche/astro/content/pure';
import type { Kind } from '../../shared/roots';
import { contains, height, locate } from './locate';

/**
 * Where a node may go, by the same rules the validator applies, so the
 * editor offers only places that will render: the parent's widget must
 * declare the slot (or `*`), allow the widget, have room under `max`; the
 * tree must stay within the depth limit; a node holds at most six filled
 * slots; nothing moves into itself; an Outlet lives only in a layout.
 */
export type Target = { root: string; index: number } | { parent: string; slot: string; index: number };

export interface SlotMeta {
  label?: string;
  help?: string;
  allow?: string[];
  min?: number;
  max?: number;
}

export interface RulesCatalog {
  widgets: Record<string, { slots?: Record<string, SlotMeta>; hidden?: boolean }>;
}

/** A node fills at most this many slots (Node.astro forwards six). */
export const MAX_FILLED_SLOTS = 6;

export function slotMeta(catalog: RulesCatalog, widget: string, slot: string): SlotMeta | null {
  const slots = catalog.widgets[widget]?.slots ?? {};
  return slots[slot] ?? slots['*'] ?? null;
}

export function canPlace(catalog: RulesCatalog, kind: Kind, data: Record<string, any>, target: Target, node: Node, movingId?: string): { ok: true } | { ok: false; reason: string } {
  if (node.widget === 'Outlet' && kind !== 'layout') return { ok: false, reason: 'an Outlet belongs in a layout' };
  if (movingId && 'parent' in target) {
    const moving = locate(kind, data, movingId);
    if (moving && contains(moving.node, target.parent)) return { ok: false, reason: 'a node cannot move into itself' };
  }
  let depth = 0;
  if ('parent' in target) {
    const parent = locate(kind, data, target.parent);
    if (!parent) return { ok: false, reason: 'the parent is gone' };
    const meta = slotMeta(catalog, parent.node.widget, target.slot);
    if (!meta) return { ok: false, reason: `${parent.node.widget} has no slot "${target.slot}"` };
    if (meta.allow && !meta.allow.includes(node.widget)) return { ok: false, reason: `${parent.node.widget}.${target.slot} takes ${meta.allow.join(', ')}` };
    const list = parent.node.slots?.[target.slot] ?? [];
    const count = list.filter((n) => n.id !== movingId).length;
    if (meta.max !== undefined && count >= meta.max) return { ok: false, reason: `${parent.node.widget}.${target.slot} takes at most ${meta.max}` };
    const filled = Object.entries(parent.node.slots ?? {}).filter(([s, kids]) => s !== target.slot && Array.isArray(kids) && kids.some((k) => k.id !== movingId)).length;
    if (count === 0 && filled >= MAX_FILLED_SLOTS) return { ok: false, reason: `a node fills at most ${MAX_FILLED_SLOTS} slots` };
    depth = parent.depth + 1;
  }
  if (depth + height(node) > MAX_NODE_DEPTH) return { ok: false, reason: `too deep: trees stop at ${MAX_NODE_DEPTH} levels (a widget of your own can hold the rest)` };
  return { ok: true };
}
