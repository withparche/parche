/**
 * The rules every page address follows, in one place: the default locale is
 * never prefixed and every other one is (`/about`, `/es/acerca`); an entry
 * kept in a locale folder (`es/about`) belongs to that locale; `home` is a
 * locale's root. Core's page route, the apps that generate pages (the blog)
 * and the development tools (the builder) all build addresses with these,
 * so a page is always linked where it is served. Pure: no Astro, no Vite.
 */

/** Prefix a site path with its locale, unless it is the default one. */
export function localizePath(path: string, locale?: string, defaultLocale?: string): string {
  if (!locale || !defaultLocale || locale === defaultLocale) return path;
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * An entry id or a URL path split into its locale and the rest:
 * `es/about` → `{ locale: 'es', key: 'about' }`. A first segment that is not
 * one of `locales` is part of the key, and the entry is the default locale's.
 */
export function splitLocale(id: string, locales: readonly string[], defaultLocale: string): { locale: string; key: string } {
  const clean = id.replace(/^\/+/, '');
  const slash = clean.indexOf('/');
  const head = slash === -1 ? clean : clean.slice(0, slash);
  if (locales.includes(head)) return { locale: head, key: slash === -1 ? '' : clean.slice(slash + 1) };
  return { locale: defaultLocale, key: clean };
}

/**
 * Where a page is served: `home` at its locale's root, any other at its
 * `urlSlug` (or its key), prefixed by its locale unless it is the default.
 * `pagePath('home', 'en', 'en')` is `/`; `pagePath('about', 'es', 'en', 'acerca')` is `/es/acerca`.
 */
export function pagePath(key: string, locale: string, defaultLocale: string, urlSlug?: string): string {
  if (key === 'home') return locale === defaultLocale ? '/' : `/${locale}`;
  return localizePath(`/${urlSlug ?? key}`, locale, defaultLocale);
}

/**
 * A string as a URL segment: accents dropped ("Guías" → "guias"), lowercase,
 * words joined by hyphens, anything else removed.
 */
export function slugify(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** A page's translations, as site paths, made absolute for `hreflang` (relative when the site has no URL). */
export function absoluteAlternates(alternates: { locale: string; path: string }[], site?: URL | string): { locale: string; path: string; href: string }[] {
  return alternates.map((a) => ({ ...a, href: site ? new URL(a.path, site).href : a.path }));
}
