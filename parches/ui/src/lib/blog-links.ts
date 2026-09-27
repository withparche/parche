/**
 * Link helpers for the homepage blog widgets (BlogLatestPosts, BlogHighlightedPosts).
 *
 * With the blog registered, a post's address comes from the blog itself,
 * through core's `parche:registry/urls` (the widgets ask `urlFor('posts')`).
 * `postHref` below is only the fallback for a site that has posts but not
 * the blog parche: the default permalink pattern, read from `parche:app/blog`
 * when present.
 */

import { localizePath, slugify } from '@parche/astro/content/pure';

export interface BlogLinkContext {
  /** Permalink pattern for a post, e.g. '/blog/%slug%'. */
  postPattern: string;
  /** Listing path, e.g. '/blog'. */
  listing: string;
  defaultLocale: string;
}

/** Read the blog + i18n config, falling back to Parche's defaults when absent. */
export async function getBlogLinkContext(): Promise<BlogLinkContext> {
  let postPattern = '/blog/%slug%';
  let listing = '/blog';
  let defaultLocale = 'en';

  try {
    const blog = (await import('parche:app/blog')).default as
      | { permalinks?: { post?: string; listing?: string } }
      | undefined;
    postPattern = blog?.permalinks?.post ?? postPattern;
    listing = blog?.permalinks?.listing ?? listing;
  } catch {
    // No blog parche registered — keep the defaults.
  }

  try {
    defaultLocale = (await import('parche:config/i18n')).defaultLocale ?? defaultLocale;
  } catch {
    // No i18n config — single-locale site.
  }

  return { postPattern, listing, defaultLocale };
}

/** The locale of a post entry is the first segment of its content id. */
export function postLocale(id: string, defaultLocale: string): string {
  const slash = id.indexOf('/');
  return slash === -1 ? defaultLocale : id.slice(0, slash);
}

/** The post key (id without the locale prefix and without the file extension). */
export function postKey(id: string): string {
  const slash = id.indexOf('/');
  const key = slash === -1 ? id : id.slice(slash + 1);
  return key.replace(/\.\w+$/, '');
}

/** Core's rule: the default locale is never prefixed. */
export { localizePath };

/** Resolve a post's href from the configured permalink pattern. */
export function postHref(
  pattern: string,
  post: { id: string; data: { urlSlug?: string; publishDate?: Date | string; category?: string; authors?: string[] } },
  locale: string,
  defaultLocale: string,
): string {
  const d = post.data.publishDate ? new Date(post.data.publishDate) : new Date(0);
  const pad = (n: number) => String(n).padStart(2, '0');

  const path = pattern
    .replace(/%slug%/g, post.data.urlSlug ?? postKey(post.id))
    .replace(/%year%/g, String(d.getFullYear()))
    .replace(/%month%/g, pad(d.getMonth() + 1))
    .replace(/%day%/g, pad(d.getDate()))
    .replace(/%hour%/g, pad(d.getHours()))
    .replace(/%minute%/g, pad(d.getMinutes()))
    .replace(/%second%/g, pad(d.getSeconds()))
    .replace(/%category%/g, post.data.category ? slugify(post.data.category) : 'uncategorized')
    .replace(/%author%/g, post.data.authors?.[0] ? slugify(post.data.authors[0]) : 'anonymous');

  return localizePath(path, locale, defaultLocale);
}
