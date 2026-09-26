import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

/**
 * The images a site can reference as `@/assets/images/…` — the same folder
 * core's resolveAssets globs — for the editor's image picker. Read-only.
 */
export const IMAGE = /\.(png|jpe?g|gif|svg|webp|avif)$/i;

export function listAssets(root: string): { value: string; name: string; size: number }[] {
  const base = path.join(root, 'src', 'assets', 'images');
  if (!existsSync(base)) return [];
  const out: { value: string; name: string; size: number }[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) walk(full);
      else if (IMAGE.test(name)) {
        const rel = path.relative(base, full).split(path.sep).join('/');
        out.push({ value: `@/assets/images/${rel}`, name: rel, size: st.size });
      }
    }
  };
  walk(base);
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/** The file behind an `@/assets/images/…` value, or null when it is not one of them. */
export function assetFile(root: string, value: string): string | null {
  const match = listAssets(root).find((a) => a.value === value);
  return match ? path.join(root, 'src', 'assets', 'images', match.name) : null;
}
