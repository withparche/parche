import { getCollection } from 'astro:content';
import type { Node } from '../content/node.js';
import { walkNodes } from '../content/node.js';

/**
 * Presets: saved subtrees in the `presets` collection. A page inserts one by
 * name with `{ "widget": "Preset", "props": { "name": "pricing-with-faq" } }`;
 * the node is replaced by the preset's tree before rendering, so the widgets
 * inside are validated and rendered like any others. An editor may instead
 * copy the tree into the page, which is the same result without the link.
 *
 * A preset may contain another; a cycle stops at the depth limit with a
 * warning rather than recursing forever.
 */
type PresetEntry = { id: string; data: { tree: Node[] } };

const CACHE = import.meta.env.PROD;
let _index: Map<string, PresetEntry> | null = null;

async function getIndex(): Promise<Map<string, PresetEntry>> {
  if (CACHE && _index) return _index;
  let entries: PresetEntry[] = [];
  try {
    entries = (await getCollection('presets' as any)) as unknown as PresetEntry[];
  } catch {
    entries = [];
  }
  const index = new Map(entries.map((e) => [e.id, e]));
  if (CACHE) _index = index;
  return index;
}

/** Resolve a preset id: `{locale}/{name}` first, then `{name}`. */
function lookup(index: Map<string, PresetEntry>, name: string, locale?: string): PresetEntry | undefined {
  return (locale && index.get(`${locale}/${name}`)) || index.get(name);
}

const MAX_EXPANSIONS = 3;

/** Replace every `Preset` node in the trees by its tree, recursively. */
export async function expandPresets(nodes: Node[], locale?: string, depth = 0): Promise<Node[]> {
  // Only a tree that uses a preset somewhere reads the collection: a site
  // without presets is never told it has none.
  if (![...walkNodes(nodes)].some(({ node }) => node.widget === 'Preset')) return nodes;
  const index = await getIndex();
  const out: Node[] = [];
  for (const node of nodes) {
    if (node.widget === 'Preset') {
      const name = String(node.props?.name ?? '');
      const entry = lookup(index, name, locale);
      if (!entry) {
        if (import.meta.env.DEV) console.warn(`[parche] Preset "${name}" is not in the presets collection.`);
        continue;
      }
      if (depth >= MAX_EXPANSIONS) {
        if (import.meta.env.DEV) console.warn(`[parche] Preset "${name}" nests presets more than ${MAX_EXPANSIONS} deep; stopped.`);
        continue;
      }
      out.push(...(await expandPresets(entry.data.tree, locale, depth + 1)));
      continue;
    }
    if (node.slots) {
      const slots: Record<string, Node[]> = {};
      for (const [slot, children] of Object.entries(node.slots)) slots[slot] = await expandPresets(children, locale, depth);
      out.push({ ...node, slots });
    } else {
      out.push(node);
    }
  }
  return out;
}
