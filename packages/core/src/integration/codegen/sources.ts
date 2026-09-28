import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { ResolvedRegistry } from '../types.js';

// Core's base.css is the Tailwind root (it has `@import "tailwindcss"`). We
// append each parche's absolute @source globs into it at transform time —
// Tailwind v4 only honors @source in the root's own cascade, and only absolute
// paths reach sibling packages once installed from npm.
export const BASE_CSS_PATH = fileURLToPath(new URL('../../styles/base.css', import.meta.url));

/**
 * Tailwind `@source` directives (absolute globs) for every parche's component
 * files, appended into base.css so the classes those components use are
 * generated — including when the parches are installed from npm, where relative
 * @source paths can't reach sibling packages. Absolute paths come from each
 * parche's factory.
 */
export function generateSourceDirectives(registry: ResolvedRegistry): string {
  return registry.contentGlobs.map((g) => `@source ${JSON.stringify(g)};`).join('\n');
}

/**
 * Is this the core base.css (the Tailwind root we inject @source into)?
 * Compares by realpath so a symlinked path (pnpm's isolated layout) still
 * matches — otherwise a mismatch would silently drop every parche's classes.
 * A consuming app's own base.css has a different realpath and won't match.
 */
export function isCoreBaseCss(file: string): boolean {
  if (file === BASE_CSS_PATH) return true;
  if (!file.endsWith('base.css')) return false;
  try {
    return fs.realpathSync(file) === fs.realpathSync(BASE_CSS_PATH);
  } catch {
    return false;
  }
}

/** Core's base.css with the parches' `@source` globs appended: what Tailwind compiles. */
export function baseCssWithSources(registry: ResolvedRegistry): string {
  const css = fs.readFileSync(BASE_CSS_PATH, 'utf-8');
  return `${css}\n${generateSourceDirectives(registry)}\n`;
}
