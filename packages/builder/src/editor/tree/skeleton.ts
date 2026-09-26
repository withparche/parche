import type { Node } from '@parche/astro/content/pure';
import { emptyOf, fieldOf, type JsonSchema } from '../forms/schema';
import { newId } from './ids';
import type { SlotMeta } from './rules';

/**
 * A new node for a widget: only the props it requires and has no default
 * for (the widget's own defaults stay unwritten, so the file says only what
 * differs), and the slots it needs filled (`min`) with the first widget
 * each allows.
 */
export function skeleton(catalog: { widgets: Record<string, { schema?: unknown; slots?: Record<string, SlotMeta> }> }, widget: string, depth = 0, pattern?: { schema?: unknown }): Node {
  const entry = pattern ?? catalog.widgets[widget];
  const node: Node = { widget, id: newId() };
  const schema = entry?.schema as JsonSchema | undefined;
  if (schema) {
    const f = fieldOf(schema);
    if (f.kind === 'object') {
      const props = Object.fromEntries(f.properties.filter((p) => p.required).map((p) => [p.key, emptyOf(p.field)]));
      if (Object.keys(props).length) node.props = props;
    }
  }
  const slots = (catalog.widgets[widget]?.slots ?? {}) as Record<string, SlotMeta>;
  for (const [slot, meta] of Object.entries(slots)) {
    if (slot === '*' || !meta.min || depth >= 2) continue;
    const child = meta.allow?.[0];
    if (!child) continue;
    node.slots ??= {};
    node.slots[slot] = Array.from({ length: meta.min }, () => skeleton(catalog, child, depth + 1));
  }
  return node;
}
