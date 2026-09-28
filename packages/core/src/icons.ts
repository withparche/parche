import fs from 'node:fs';
import path from 'node:path';
import type { ParcheManifest } from './integration/types.js';

/**
 * The icons a site can render, by set, for astro-icon's `include`:
 *
 *   icon({ include: usedIcons(parches) })
 *
 * Without `include`, astro-icon bundles every set the site installs whole
 * (Tabler alone is 2 MB of SVG) into a server build, and the server loads
 * it on every cold start. Parche is data-driven: a widget takes its icon's
 * name from content, so astro-icon cannot see which icons a site uses by
 * scanning code alone. This reads every `<set>:<name>` written in the
 * site's `src/` and in the sources the parches point at (their widgets,
 * elements, templates and views), for the sets installed as
 * `@iconify-json/<set>`. A name put together at run time is not seen: add
 * it with `also`.
 */
export interface UsedIconsOptions {
  /** The project root. Default: the working directory. */
  root?: string;
  /** The site's source folder, scanned whole (Astro's `srcDir`). Default: `src` under the root. */
  srcDir?: string;
  /** Icons to include besides the ones found, by set. */
  also?: Record<string, string[]>;
  /** The sets to consider. Default: every set installed as `@iconify-json/<set>`. */
  sets?: string[];
}

const TEXT = new Set(['.astro', '.ts', '.tsx', '.js', '.mjs', '.jsx', '.json', '.md', '.mdx', '.yaml', '.yml', '.html', '.svelte', '.vue']);
const SKIP = new Set(['node_modules', 'dist', '.astro', '.git']);
const NAME = /(?<![\w./-])([a-z][a-z0-9-]*):([a-z0-9][a-z0-9-]*)(?![\w-])/g;

export function usedIcons(parches: ParcheManifest[] = [], options: UsedIconsOptions = {}): Record<string, string[]> {
  const root = path.resolve(options.root ?? process.cwd());
  const dirs = new Set<string>([path.resolve(root, options.srcDir ?? 'src')]);
  for (const manifest of parches) for (const dir of sourceDirs(manifest)) dirs.add(dir);

  const installed = new Map<string, boolean>();
  const known = (set: string) => {
    if (options.sets) return options.sets.includes(set);
    if (!installed.has(set)) installed.set(set, isInstalled(root, set));
    return installed.get(set)!;
  };

  const found = new Map<string, Set<string>>();
  const add = (set: string, name: string) => (found.get(set) ?? found.set(set, new Set()).get(set)!).add(name);
  for (const dir of outermost(dirs)) {
    for (const file of walk(dir)) {
      let text: string;
      try {
        if (fs.statSync(file).size > 2 * 1024 * 1024) continue;
        text = fs.readFileSync(file, 'utf8');
      } catch {
        continue;
      }
      for (const m of text.matchAll(NAME)) if (known(m[1])) add(m[1], m[2]);
    }
  }
  for (const [set, names] of Object.entries(options.also ?? {})) for (const name of names) add(set, name);

  return Object.fromEntries([...found].sort(([a], [b]) => a.localeCompare(b)).map(([set, names]) => [set, [...names].sort()]));
}

/**
 * Whether `@iconify-json/<set>` is installed for the project: found in a
 * `node_modules` from the root upwards, as Node resolves it. Looked up on
 * disk rather than resolved, because the sets' packages export only their
 * data files, never `package.json`.
 */
function isInstalled(root: string, set: string): boolean {
  let dir = root;
  for (;;) {
    if (fs.existsSync(path.join(dir, 'node_modules', '@iconify-json', set, 'package.json'))) return true;
    const parent = path.dirname(dir);
    if (parent === dir) return false;
    dir = parent;
  }
}

/** Every directory a manifest points at through an absolute path: its widgets', elements', templates', views'. */
function sourceDirs(manifest: ParcheManifest): string[] {
  const dirs = new Set<string>();
  const visit = (value: unknown): void => {
    if (typeof value === 'string') {
      if (!path.isAbsolute(value)) return;
      // A glob names the directory before its first wildcard.
      const plain = value.includes('*') ? value.slice(0, value.indexOf('*')) : value;
      try {
        const stat = fs.statSync(plain);
        dirs.add(stat.isDirectory() ? plain : path.dirname(plain));
      } catch {
        /* not on disk: nothing to scan */
      }
    } else if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') Object.values(value).forEach(visit);
  };
  visit(manifest);
  return [...dirs];
}

/** The directories not inside another of the set, so nothing is read twice. */
function outermost(dirs: Set<string>): string[] {
  const list = [...dirs].map((d) => path.resolve(d));
  return list.filter((d) => !list.some((o) => o !== d && d.startsWith(o + path.sep)));
}

function* walk(dir: string): Generator<string> {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP.has(entry.name)) yield* walk(full);
    } else if (TEXT.has(path.extname(entry.name))) yield full;
  }
}
