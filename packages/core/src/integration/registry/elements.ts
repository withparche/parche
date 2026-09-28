import fs from 'node:fs';
import path from 'node:path';
import type { ElementEntry, ResolvedElement } from '../types.js';

/**
 * Convert an override key ('widgets:hero:Hero') to a virtual module ID ('parche:widgets/hero/Hero')
 */
export function overrideKeyToVirtualId(key: string): string {
  return 'parche:' + key.replace(/:/g, '/');
}

/** 'Tabs' → 'tabs', 'CallToAction' → 'call-to-action' (the .props.ts naming). */
function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Normalise a manifest element (bare path or folder entry) into what the
 * registry tracks. A bare path is a single-part element whose folder is the
 * file's directory; `props` defaults to `<dir>/<kebab>.props.ts` when present.
 */
export function resolveElement(from: string, name: string, value: string | ElementEntry): ResolvedElement {
  const entry = typeof value === 'string' ? { entry: value } : value;
  const dir = path.dirname(entry.entry);
  const props = entry.props ?? path.join(dir, `${kebab(name)}.props.ts`);
  return {
    name,
    from,
    entry: entry.entry,
    dir,
    parts: entry.parts ?? {},
    props: fs.existsSync(props) ? props : undefined,
    style: entry.style,
    compound: !entry.entry.endsWith('.astro'),
  };
}

/**
 * Resolve an override target: a file is used as-is; a directory resolves to
 * its `index.ts`, then `index.astro`. Returns null when nothing exists, so the
 * caller can report it with attribution instead of a later Vite resolve error.
 */
export function resolveOverridePath(rootDir: string, overridePath: string): string | null {
  const abs = path.resolve(rootDir, overridePath);
  if (!fs.existsSync(abs)) return null;
  if (!fs.statSync(abs).isDirectory()) return abs;
  for (const index of ['index.ts', 'index.astro']) {
    const candidate = path.join(abs, index);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}
