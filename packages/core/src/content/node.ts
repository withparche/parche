import { z } from 'zod';

/**
 * The node: one widget with its props and, when the widget declares slots,
 * the nodes that fill them. Pages, layouts and presets are all trees of
 * nodes; there is one schema, one renderer and one validator for the three.
 *
 * Nothing is wrapped by default. A list of nodes (a layout's Outlet, a page)
 * may declare a wrapper that each of its items is rendered in, unless the
 * item's widget declares `wrapper: false` (content/wrapper.ts). A nested node
 * is never wrapped. Which widgets may fill a slot, and how many,
 * is declared by the widget in its `.props.ts` and checked by the build, not
 * here: zod does not know the registry.
 */
export interface Node {
  /** The widget, as registered (`Hero`, `Section`, `Outlet`). */
  widget: string;
  props?: Record<string, unknown>;
  /** Slot name → the nodes that fill it. `default` is the widget's unnamed slot. */
  slots?: Record<string, Node[]>;
  /** A note for whoever edits the page next; never rendered. */
  notes?: string;
  /** Optional stable identifier, written by an editor, never required by hand. */
  id?: string;
}

export const nodeSchema: z.ZodType<Node> = z.lazy(() =>
  z.object({
    widget: z.string().min(1),
    props: z.record(z.string(), z.unknown()).optional(),
    slots: z.record(z.string(), z.array(nodeSchema)).optional(),
    notes: z.string().optional(),
    id: z.string().optional(),
  }),
);

export const nodeListSchema = z.array(nodeSchema);

/** How deep a tree may go: a page, a container, a container in it, and leaves. */
export const MAX_NODE_DEPTH = 3;

/** Walk every node of a tree, depth first, with its depth (roots are 0). */
export function* walkNodes(nodes: Node[], depth = 0): Generator<{ node: Node; depth: number }> {
  for (const node of nodes) {
    yield { node, depth };
    for (const children of Object.values(node.slots ?? {})) yield* walkNodes(children, depth + 1);
  }
}

/** Every widget name a tree references, deduped, for the lazy widget loader. */
export function widgetNames(nodes: Node[]): string[] {
  const out = new Set<string>();
  for (const { node } of walkNodes(nodes)) out.add(node.widget);
  return [...out];
}
