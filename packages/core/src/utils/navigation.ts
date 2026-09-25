import { getCollection } from 'astro:content';
import type { Node } from '../content/node.js';
import { hasNavigationRef, substituteNavigation, type MissingMenu } from '../content/navigation.js';

export type { MissingMenu };

/**
 * Menus live once, in the `navigation` collection (one file per menu and
 * locale: `src/content/navigation/en/main.json` → `{ "items": [ … ] }`), and
 * any prop can point at one instead of repeating it:
 *
 *   { "widget": "Header", "props": { "links": { "$navigation": "main" } } }
 *
 * Before a tree renders, every `{ "$navigation": name }` value is replaced by
 * that menu's `items`, so the widget receives the plain list its schema
 * expects. The same header then serves every layout, and the builder edits a
 * menu in one place. Lookup is `{locale}/{name}` first, then `{name}`.
 */
type NavigationEntry = { id: string; data: { items: unknown[] } };

const CACHE = import.meta.env.PROD;
let _index: Map<string, NavigationEntry> | null = null;

async function getIndex(): Promise<Map<string, NavigationEntry>> {
  if (CACHE && _index) return _index;
  let entries: NavigationEntry[] = [];
  try {
    entries = (await getCollection('navigation' as any)) as unknown as NavigationEntry[];
  } catch {
    entries = [];
  }
  const index = new Map(entries.map((e) => [e.id, e]));
  if (CACHE) _index = index;
  return index;
}

/**
 * Replace every `$navigation` reference in the trees' props by the menu's
 * items. A missing menu becomes an empty list and is reported, so the page
 * renders and the build can fail on it like any other content issue.
 */
export async function resolveNavigation(nodes: Node[], locale?: string, base = 'sections'): Promise<{ nodes: Node[]; missing: MissingMenu[] }> {
  if (!hasNavigationRef(nodes)) return { nodes, missing: [] };
  const index = await getIndex();
  const find = (name: string) => ((locale && index.get(`${locale}/${name}`)) || index.get(name))?.data.items;
  return substituteNavigation(nodes, find, base);
}
