import { getCollection } from 'astro:content';
import { ancestorKeys, pagePath } from './paths.js';

export { localizePath, splitLocale, pagePath, slugify, absoluteAlternates } from './paths.js';

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
  return pagePath(entry.pageKey, entry.locale, defaultLocale, entry.slug).slice(1);
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

// A page's translations are the entries that share its key. Grouped once per
// slug map (the cached one, in production; a fresh one in dev, where the map
// is rebuilt per request anyway), so every page is a lookup rather than a
// scan of every page, which made a build cost the square of its pages.
const byPageKey = new WeakMap<SlugMapEntry[], Map<string, SlugMapEntry[]>>();

function translationsOf(pageKey: string, slugMap: SlugMapEntry[]): SlugMapEntry[] {
  let groups = byPageKey.get(slugMap);
  if (!groups) {
    groups = new Map();
    for (const entry of slugMap) (groups.get(entry.pageKey) ?? groups.set(entry.pageKey, []).get(entry.pageKey)!).push(entry);
    byPageKey.set(slugMap, groups);
  }
  return groups.get(pageKey) ?? [];
}

/**
 * A page's breadcrumb trail below the site's root: the ancestors that exist
 * as pages in its locale (by key: `services` above `services/design`), then
 * the page itself, each with its title and address. An ancestor with no page
 * in that locale is skipped, so every crumb is a page a reader can open.
 */
export function pageTrail(pageKey: string, locale: string, slugMap: SlugMapEntry[], defaultLocale: string): Array<{ name: string; path: string }> {
  const crumbs: Array<{ name: string; path: string }> = [];
  for (const key of [...ancestorKeys(pageKey), pageKey]) {
    const entry = translationsOf(key, slugMap).find((e) => e.locale === locale);
    if (entry) crumbs.push({ name: (entry.data.title as string) ?? key, path: pagePath(entry.pageKey, entry.locale, defaultLocale, entry.slug) });
  }
  return crumbs;
}

export function getAlternateUrls(
  pageKey: string,
  slugMap: SlugMapEntry[],
  defaultLocale: string,
  site?: URL,
): Array<{ locale: string; href: string; path: string }> {
  return translationsOf(pageKey, slugMap).map((entry) => {
    // The one rule for page addresses (utils/paths.ts), as the route serves them.
    const path = pagePath(entry.pageKey, entry.locale, defaultLocale, entry.slug);
    return { locale: entry.locale, href: site ? new URL(path, site).href : path, path };
  });
}
