/**
 * A page's URL on the site from its id, as the page route builds it: the
 * locale prefix unless it is the default, `home` at the root, the page's
 * `urlSlug` over its name. Shared by the catalog and the editor's preview.
 */
export function pageUrl(id: string, urlSlug: string | undefined, defaultLocale: string): string {
  const [locale, ...rest] = id.includes('/') ? id.split('/') : [defaultLocale, id];
  const key = rest.join('/');
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  if (key === 'home') return prefix || '/';
  return `${prefix}/${urlSlug ?? key}`;
}
