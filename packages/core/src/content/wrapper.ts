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
 * it writes only what differs. Or, shorter and one level less, the item says
 * it on itself:
 *
 *   { "widget": "Features", "wrapper": { "props": { "id": "pricing", "tone": "surface" } }, "props": { … } }
 *
 * `{ widget, props }` names another wrapper widget (only its props apply),
 * and `false` leaves the item bare. A widget whose meta says `wrapper: false`
 * (a full-bleed hero, the header) is left bare unless the item asks.
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

/**
 * The wrapper a node is rendered in: its own when it says (over the list's,
 * when both are the same widget), else the list's. Null for none.
 */
export function nodeWrapper(own: WrapperSpec | undefined, list: ListWrapper | null, defaultWidget: string | null | undefined): ListWrapper | null {
  if (own === undefined) return list;
  if (own === false) return null;
  const name = own.widget ?? list?.name ?? defaultWidget;
  if (!name) return null;
  const inherited = list && list.name === name ? list.props : {};
  return { name, props: { ...inherited, ...(own.props ?? {}) } };
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
