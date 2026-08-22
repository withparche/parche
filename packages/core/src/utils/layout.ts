import { getCollection } from 'astro:content';
import type { SectionEntry } from '../content/schemas.js';

/** Hardcoded base layout: just a Main area (no header/footer) */
const BASE_LAYOUT_SECTIONS: SectionEntry[] = [{ widget: 'layout/Main' }];

type LayoutEntry = { id: string; data: { sections: SectionEntry[] } };

// Content collections are immutable at runtime, so build the id→entry index
// once and reuse it across requests. Cache only in prod — in dev, content edits
// must re-read (mirrors the i18n slug-index caching).
const CACHE = import.meta.env.PROD;
let _layoutIndex: Map<string, LayoutEntry> | null = null;

async function getLayoutIndex(): Promise<Map<string, LayoutEntry> | null> {
  if (CACHE && _layoutIndex) return _layoutIndex;
  let allLayouts;
  try {
    allLayouts = await getCollection('layouts');
  } catch {
    return null;
  }
  if (!allLayouts || allLayouts.length === 0) return null;
  const index = new Map<string, LayoutEntry>(
    (allLayouts as LayoutEntry[]).map((entry) => [entry.id, entry]),
  );
  if (CACHE) _layoutIndex = index;
  return index;
}

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
  const index = await getLayoutIndex();
  if (!index) return BASE_LAYOUT_SECTIONS;

  const entry =
    index.get(`${locale}/${name}`) ??
    index.get(`${defaultLocale}/${name}`) ??
    index.get(`${locale}/default`) ??
    index.get(`${defaultLocale}/default`);

  return entry ? entry.data.sections : BASE_LAYOUT_SECTIONS;
}
