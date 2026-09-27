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
  /** The unprefixed path for this route, e.g. '/blog'. */
  path?: string;
  /** Per-locale path, for routes whose segment is translated (a tag's slug can
   *  differ per language). Takes precedence over `path`. */
  pathFor?: (locale: string) => string | Promise<string>;
  locales: string[];
  defaultLocale: string;
  /** Return false to leave a locale out. Defaults to including every locale. */
  hasContent?: (locale: string) => boolean | Promise<boolean>;
}): Promise<RouteAlternate[]> {
  const { path, pathFor, locales, defaultLocale, hasContent } = opts;
  const out: RouteAlternate[] = [];

  for (const locale of locales) {
    if (hasContent && !(await hasContent(locale))) continue;
    const localePath = pathFor ? await pathFor(locale) : path;
    if (!localePath) continue;
    out.push({ locale, path: localizePath(localePath, locale, defaultLocale) });
  }

  return out;
}

/** Route alternates as absolute hrefs, by core's rule (relative when the site has no URL). */
export { absoluteAlternates as toAbsolute } from '@parche/astro/content/pure';
