/**
 * Link helpers for the homepage blog widgets (BlogLatestPosts, BlogHighlightedPosts).
 *
 * These widgets live in the ui parche, which cannot import `@parche/blog` — the
 * dependency runs the other way (the blog parche requires ui's `blog/*` widgets).
 * So the blog's permalink pattern is read at runtime from the `parche:app/blog`
 * virtual module, and the substitution below mirrors `resolvePostPermalink` in
 * `parches/blog/src/types.ts`. Keep the two in sync.
 */

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

/** Prefix a path with the locale segment, unless it is the default locale. */
export function localizePath(path: string, locale: string, defaultLocale: string): string {
  if (locale === defaultLocale) return path;
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Resolve a post's href from the configured permalink pattern. */
export function postHref(
  pattern: string,
  post: { id: string; data: { urlSlug?: string; publishDate?: Date | string; category?: string } },
  locale: string,
  defaultLocale: string,
): string {
  const d = post.data.publishDate ? new Date(post.data.publishDate) : new Date(0);
  const pad = (n: number) => String(n).padStart(2, '0');
  const slugify = (v: string) =>
    v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const path = pattern
    .replace(/%slug%/g, post.data.urlSlug ?? postKey(post.id))
    .replace(/%year%/g, String(d.getFullYear()))
    .replace(/%month%/g, pad(d.getMonth() + 1))
    .replace(/%day%/g, pad(d.getDate()))
    .replace(/%hour%/g, pad(d.getHours()))
    .replace(/%minute%/g, pad(d.getMinutes()))
    .replace(/%second%/g, pad(d.getSeconds()))
    .replace(/%category%/g, post.data.category ? slugify(post.data.category) : 'uncategorized');

  return localizePath(path, locale, defaultLocale);
}
