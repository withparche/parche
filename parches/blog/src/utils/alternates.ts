/**
 * Translations for the blog's own routes (listing, tags, categories, authors,
 * series).
 *
 * These are not content entries, so there is no `postKey` to pair them by — the
 * same route simply exists under each locale prefix. What varies is whether it
 * has anything to show: `/blog` exists in every locale, but `/es/blog/tag/x`
 * only makes sense if some Spanish post carries that tag.
 *
 * Callers supply a predicate that answers "does this locale have content for
 * this route?", so a locale with nothing is left out rather than advertised as a
 * translation that leads to a 404.
 */
import { localizePath } from '../types.js';

export interface RouteAlternate {
  locale: string;
  /** Site-relative path, e.g. '/es/blog/tag/astro'. */
  path: string;
}

export async function getRouteAlternates(opts: {
  /** The unprefixed path for this route, e.g. '/blog' or '/blog/tag/astro'. */
  path: string;
  locales: string[];
  defaultLocale: string;
  /** Return false to leave a locale out. Defaults to including every locale. */
  hasContent?: (locale: string) => boolean | Promise<boolean>;
}): Promise<RouteAlternate[]> {
  const { path, locales, defaultLocale, hasContent } = opts;
  const out: RouteAlternate[] = [];

  for (const locale of locales) {
    if (hasContent && !(await hasContent(locale))) continue;
    out.push({ locale, path: localizePath(path, locale, defaultLocale) });
  }

  return out;
}

/** Turn route alternates into the absolute-href shape core expects. */
export function toAbsolute(
  alternates: RouteAlternate[],
  site: URL | undefined,
): Array<{ locale: string; href: string; path: string }> {
  return alternates.map((alt) => ({
    locale: alt.locale,
    path: alt.path,
    href: site ? new URL(alt.path, site).href : alt.path,
  }));
}
