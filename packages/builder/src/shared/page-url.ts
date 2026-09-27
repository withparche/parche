import { pagePath } from '@parche/astro/content/pure';

/**
 * A page's URL on the site from its id, by core's rule for page addresses:
 * a page id is `<locale>/<key>`; `home` is its locale's root; the page's
 * `urlSlug` wins over its key. Shared by the catalog and the editor's preview.
 */
export function pageUrl(id: string, urlSlug: string | undefined, defaultLocale: string): string {
  const [locale, ...rest] = id.includes('/') ? id.split('/') : [defaultLocale, id];
  return pagePath(rest.join('/'), locale, defaultLocale, urlSlug);
}
