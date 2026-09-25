import type { Node } from './node.js';

/**
 * The wrapper of a list of widgets. Nothing is wrapped by default: a tree is
 * rendered as written, and a node inside a slot is never wrapped. A wrapper
 * belongs to a list, the classic page being a list of widgets that each want
 * the same band around them (a measure, a rhythm, an anchor). The list says
 * so once, on the layout's Outlet or on the page:
 *
 *   { "widget": "Outlet", "props": { "wrapper": { "widget": "Section", "props": { "spacing": "md" } } } }
 *
 * and every item of that list is rendered inside that widget with those
 * props. An item that needs other props writes the wrapper itself,
 *
 *   { "widget": "Section", "props": { "id": "pricing", "tone": "surface" }, "slots": { "default": [ … ] } }
 *
 * which is not wrapped again and takes the list's props as its defaults, so
 * it writes only what differs. A widget whose meta says `wrapper: false` (a
 * full-bleed hero, the header) is left bare.
 */
export type WrapperSpec = false | { widget?: string; props?: Record<string, unknown> };

/** A list's wrapper, resolved: which widget and with what props. */
export interface ListWrapper {
  name: string;
  props: Record<string, unknown>;
}

/**
 * Resolve a list's wrapper declaration. `widget` may be left out when the
 * registry names a default wrapper widget (`wrapper` in a parche manifest);
 * without either, there is nothing to wrap with.
 */
export function listWrapper(spec: WrapperSpec | undefined, defaultWidget: string | null | undefined): ListWrapper | null {
  if (!spec || typeof spec !== 'object') return null;
  const name = spec.widget ?? defaultWidget;
  return name ? { name, props: spec.props ?? {} } : null;
}

/** The Outlet nodes of a tree with the wrapper each declares, for loading and checking. */
export function outletWrappers(nodes: Node[]): Array<{ name: string; spec: WrapperSpec | undefined; path: string }> {
  const out: Array<{ name: string; spec: WrapperSpec | undefined; path: string }> = [];
  const visit = (n: Node, path: string) => {
    if (n.widget === 'Outlet') out.push({ name: (n.props?.name as string | undefined) ?? 'default', spec: n.props?.wrapper as WrapperSpec | undefined, path });
    for (const [slot, list] of Object.entries(n.slots ?? {})) list.forEach((c, i) => visit(c, `${path}.slots.${slot}[${i}]`));
  };
  nodes.forEach((n, i) => visit(n, `layout[${i}]`));
  return out;
}
