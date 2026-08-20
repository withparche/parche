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

export async function buildSlugMap(): Promise<SlugMapEntry[]> {
  const allPages = await getCollection('pages');
  const map: SlugMapEntry[] = [];

  for (const entry of allPages) {
    const parts = entry.id.split('/');
    const locale = parts[0];
    const pageKey = parts.slice(1).join('/');
    const slug = entry.data.urlSlug ?? pageKey;
    map.push({ locale, pageKey, slug, data: entry.data, entryId: entry.id });
  }

  return map;
}

export async function resolvePageFromSlug(
  urlSlug: string | undefined,
  defaultLocale: string,
): Promise<{ pageData: any; locale: string; pageKey: string; entryId: string } | undefined> {
  const slugMap = await buildSlugMap();

  for (const entry of slugMap) {
    let expectedSlug: string | undefined;
    if (entry.pageKey === 'home') {
      expectedSlug = entry.locale === defaultLocale ? undefined : entry.locale;
    } else if (entry.locale === defaultLocale) {
      expectedSlug = entry.slug;
    } else {
      expectedSlug = `${entry.locale}/${entry.slug}`;
    }

    if ((expectedSlug ?? '') === (urlSlug ?? '')) {
      return { pageData: entry.data, locale: entry.locale, pageKey: entry.pageKey, entryId: entry.entryId };
    }
  }

  return undefined;
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
