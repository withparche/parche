import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Resolve a bare specifier to an absolute path from @parche/astro's own location.
 *
 * Generated virtual modules have no place on disk, so a bare `import ... from 'zod'`
 * inside one is resolved by Vite relative to the consuming project root — which under
 * pnpm's isolated node_modules will not see core's dependencies. Emitting the absolute
 * path instead pins the import to the copy core itself declares.
 *
 * Uses `import.meta.resolve` rather than `require.resolve` so the package's `import`
 * export condition wins: `require.resolve` picks the CJS entry, which Vite then inlines
 * as ESM and blows up with "exports is not defined".
 */
export function resolveFromCore(specifier: string): string {
  try {
    return fileURLToPath(import.meta.resolve(specifier));
  } catch {
    // Fall back to the bare specifier; the consumer may hoist or declare it itself.
    return specifier;
  }
}

/**
 * A single variant of default props for a widget.
 * Widgets can provide multiple variants (e.g., "minimal", "with image")
 * so the builder can randomly pick one when adding a new section.
 */
export interface DefaultVariant {
  label?: string;
  props: Record<string, unknown>;
}

/**
 * Load widget default variants from a sibling `.defaults.json` file.
 * Supports two formats:
 *   - Array of variants: [{ label?: string, props: {...} }, ...]
 *   - Single props object: { title: "...", ... } (wrapped as one variant)
 * Returns null if the file doesn't exist or can't be parsed.
 */
export function loadWidgetDefaults(astroFilePath: string): DefaultVariant[] | null {
  const defaultsPath = astroFilePath.replace(/\.astro$/, '.defaults.json');
  try {
    const raw = JSON.parse(fs.readFileSync(defaultsPath, 'utf-8'));
    if (Array.isArray(raw)) {
      // Array format: each element must have a `props` field
      return raw.map((entry: unknown) => {
        if (entry && typeof entry === 'object' && 'props' in entry) {
          return entry as DefaultVariant;
        }
        // Bare props object inside array
        return { props: entry as Record<string, unknown> };
      });
    }
    // Single object format: wrap as one variant
    return [{ props: raw as Record<string, unknown> }];
  } catch {
    return null;
  }
}

/**
 * Extract a widget key from a virtual module ID. Widgets use the full path
 * after the prefix to avoid collisions.
 *
 * 'parche:widgets/hero/Hero'    → 'hero/Hero'
 * 'parche:widgets/legacy/Hero'  → 'legacy/Hero'
 */
export function extractWidgetKey(virtualId: string): string {
  return virtualId.replace('parche:widgets/', '');
}

/**
 * Extract a template key from a virtual module ID.
 * 'parche:templates/contact' → 'contact'
 */
export function extractTemplateKey(virtualId: string): string {
  return virtualId.replace('parche:templates/', '');
}

/**
 * Derive the palette category from a widget virtual ID.
 * 'parche:widgets/hero/Hero'           → 'hero'
 * 'parche:widgets/call-to-action/CTA'  → 'call-to-action'
 */
export function extractWidgetCategory(virtualId: string): string {
  const after = virtualId.replace('parche:widgets/', '');
  const slashIdx = after.lastIndexOf('/');
  return slashIdx >= 0 ? after.slice(0, slashIdx) : after;
}

/**
 * Convert a PascalCase component name to a human-readable label.
 * Splits at lowercase→uppercase transitions to preserve acronyms.
 * 'FeaturesList' → 'Features List'
 * 'CallToAction' → 'Call To Action'
 * 'FAQs'         → 'FAQs'   (no lowercase→uppercase transition)
 */
export function humanLabel(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, '$1 $2').trim();
}
