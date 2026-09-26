import { createRequire } from 'node:module';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * The Iconify sets the site can use, from the project's own node_modules —
 * the ones astro-icon will find when it renders — and the ones its parches
 * bring (ui brings tabler). Indexed once per session.
 */
interface IconSet {
  prefix: string;
  width?: number;
  height?: number;
  icons: Record<string, { body: string; width?: number; height?: number }>;
  aliases?: Record<string, { parent: string }>;
}

const sets = new Map<string, IconSet>();
let indexed: string[] | null = null;

function load(root: string): Map<string, IconSet> {
  if (sets.size) return sets;
  const requires = [createRequire(path.join(root, 'package.json'))];
  try {
    requires.push(createRequire(requires[0].resolve('@parche/ui/package.json')));
  } catch {}
  const names = new Set(['tabler', 'lucide', 'simple-icons']);
  const scoped = path.join(root, 'node_modules', '@iconify-json');
  if (existsSync(scoped)) for (const n of readdirSync(scoped)) names.add(n);
  for (const name of names) {
    for (const req of requires) {
      try {
        const set = req(`@iconify-json/${name}/icons.json`) as IconSet;
        sets.set(set.prefix, set);
        break;
      } catch {}
    }
  }
  return sets;
}

export function searchIcons(root: string, query: string, limit = 60): { sets: string[]; icons: string[] } {
  const all = load(root);
  indexed ??= [...all.values()].flatMap((s) => Object.keys(s.icons).map((n) => `${s.prefix}:${n}`));
  const q = query.toLowerCase().trim();
  return { sets: [...all.keys()], icons: q ? indexed.filter((n) => n.includes(q)).slice(0, Math.min(limit, 200)) : [] };
}

/** The icon as a standalone SVG, for the editor's pickers. */
export function iconSvg(root: string, name: string): string | null {
  const [prefix, id] = name.split(':');
  const set = load(root).get(prefix);
  if (!set || !id) return null;
  const icon = set.icons[id] ?? (set.aliases?.[id] ? set.icons[set.aliases[id].parent] : undefined);
  if (!icon) return null;
  const w = icon.width ?? set.width ?? 24;
  const h = icon.height ?? set.height ?? 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="1em" height="1em">${icon.body}</svg>`;
}
