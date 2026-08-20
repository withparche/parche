import { getCollection } from 'astro:content';
import type { SectionEntry } from '../content/schemas.js';

/** Hardcoded base layout: just a Main area (no header/footer) */
const BASE_LAYOUT_SECTIONS: SectionEntry[] = [{ widget: 'layout/Main' }];

/**
 * Resolve a layout by name and locale from the layouts content collection.
 *
 * Fallback chain:
 *   1. {locale}/{name}
 *   2. {defaultLocale}/{name}
 *   3. {locale}/default
 *   4. {defaultLocale}/default
 *   5. Hardcoded base: [{ widget: 'layout/Main' }]
 */
export async function resolveLayout(
  name: string,
  locale: string,
  defaultLocale: string,
): Promise<SectionEntry[]> {
  let allLayouts;
  try {
    allLayouts = await getCollection('layouts');
  } catch {
    return BASE_LAYOUT_SECTIONS;
  }

  if (!allLayouts || allLayouts.length === 0) {
    return BASE_LAYOUT_SECTIONS;
  }

  const find = (id: string) => allLayouts.find((entry) => entry.id === id);

  const entry =
    find(`${locale}/${name}`) ??
    find(`${defaultLocale}/${name}`) ??
    find(`${locale}/default`) ??
    find(`${defaultLocale}/default`);

  if (!entry) {
    return BASE_LAYOUT_SECTIONS;
  }

  return entry.data.sections;
}
