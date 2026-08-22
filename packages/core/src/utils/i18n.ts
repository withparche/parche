import { getCollection } from 'astro:content';

// These are injected at build time via the parche:config/i18n virtual module.
// Importing here would create a circular dependency, so the functions accept
// defaultLocale as a parameter and the route/middleware passes it in.

export interface SlugMapEntry {
  locale: string;
  pageKey: string;
  slug: string;
  data: any;
  entryId: string;
}

// The `pages` collection is immutable at runtime, so in production (SSG build and
// SSR serving) we memoize the slug map + a slug→entry lookup index. This collapses
// the two `buildSlugMap` calls per page request into one and turns the linear
// resolve scan into an O(1) lookup (also fixes the static build's O(N²) — every
// generated page was rebuilding the whole map). Disabled in dev so edited content
// is always fresh.
const CACHE = import.meta.env.PROD;
let _slugMapCache: SlugMapEntry[] | null = null;
let _slugIndexCache: { defaultLocale: string; index: Map<string, SlugMapEntry> } | null = null;

export async function buildSlugMap(): Promise<SlugMapEntry[]> {
  if (CACHE && _slugMapCache) return _slugMapCache;

  const allPages = await getCollection('pages');
  const map: SlugMapEntry[] = [];

  for (const entry of allPages) {
    const parts = entry.id.split('/');
    const locale = parts[0];
    const pageKey = parts.slice(1).join('/');
    const slug = entry.data.urlSlug ?? pageKey;
    map.push({ locale, pageKey, slug, data: entry.data, entryId: entry.id });
  }

  if (CACHE) _slugMapCache = map;
  return map;
}

/** The URL slug an entry is served at (empty string = the root / home). */
function expectedSlugFor(entry: SlugMapEntry, defaultLocale: string): string {
  if (entry.pageKey === 'home') return entry.locale === defaultLocale ? '' : entry.locale;
  if (entry.locale === defaultLocale) return entry.slug;
  return `${entry.locale}/${entry.slug}`;
}

function buildSlugIndex(slugMap: SlugMapEntry[], defaultLocale: string): Map<string, SlugMapEntry> {
  const index = new Map<string, SlugMapEntry>();
  for (const entry of slugMap) {
    const key = expectedSlugFor(entry, defaultLocale);
    if (!index.has(key)) index.set(key, entry); // first wins, matching the old scan
  }
  return index;
}

export async function resolvePageFromSlug(
  urlSlug: string | undefined,
  defaultLocale: string,
): Promise<{ pageData: any; locale: string; pageKey: string; entryId: string } | undefined> {
  const slugMap = await buildSlugMap();

  let index: Map<string, SlugMapEntry>;
  if (CACHE && _slugIndexCache?.defaultLocale === defaultLocale) {
    index = _slugIndexCache.index;
  } else {
    index = buildSlugIndex(slugMap, defaultLocale);
    if (CACHE) _slugIndexCache = { defaultLocale, index };
  }

  const entry = index.get(urlSlug ?? '');
  return entry
    ? { pageData: entry.data, locale: entry.locale, pageKey: entry.pageKey, entryId: entry.entryId }
    : undefined;
}

export function getAlternateUrls(
  pageKey: string,
  slugMap: SlugMapEntry[],
  defaultLocale: string,
  site?: URL,
): Array<{ locale: string; href: string; path: string }> {
  const alternates: Array<{ locale: string; href: string; path: string }> = [];

  for (const entry of slugMap) {
    if (entry.pageKey !== pageKey) continue;

    let path: string;
    if (entry.pageKey === 'home') {
      path = entry.locale === defaultLocale ? '/' : `/${entry.locale}`;
    } else if (entry.locale === defaultLocale) {
      path = `/${entry.slug}`;
    } else {
      path = `/${entry.locale}/${entry.slug}`;
    }

    const href = site ? new URL(path, site).href : path;
    alternates.push({ locale: entry.locale, href, path });
  }

  return alternates;
}
