/**
 * UI strings for the blog, resolved per locale.
 *
 * Parche has no translation runtime, and it does not need one: strings are data,
 * like everything else. A site supplies them through `createBlog({ labels })`,
 * keyed by locale, and anything it omits falls back to the English defaults below.
 * This mirrors the `formLabels` pattern the contact template already uses.
 *
 *   createBlog({
 *     labels: {
 *       es: { listingTitle: 'Blog', readingTime: '{minutes} min de lectura' },
 *     },
 *   })
 */

export interface BlogLabels {
  /** Blog listing heading and document title. */
  listingTitle: string;
  /** Shown when a listing has no posts. */
  emptyState: string;
  /** Breadcrumb root. */
  home: string;
  /** Breadcrumb for the blog listing. */
  blog: string;

  /** Taxonomy headings. `{value}` is the tag/category/author/series name. */
  tagTitle: string;
  tagDescription: string;
  categoryTitle: string;
  categoryDescription: string;
  authorTitle: string;
  seriesTitle: string;
  seriesDescription: string;
  /** `{count}` posts in the current series. */
  seriesCount: string;
  /** Standalone prefix used by the in-post series navigation, e.g. "Series:". */
  seriesLabel: string;

  /** Pagination. */
  newerPosts: string;
  olderPosts: string;

  /** Post furniture. */
  backToBlog: string;
  relatedPosts: string;
  viewAllPosts: string;
  /** `{minutes}` reading time. */
  readingTime: string;
  share: string;
  tableOfContents: string;
  /** Series navigation: `{current}` of `{total}`. */
  seriesPart: string;
  previous: string;
  next: string;

  /** RSS feed title suffix. */
  rssFeed: string;
}

/** English defaults — the strings that were hardcoded across routes and widgets. */
export const DEFAULT_LABELS: BlogLabels = {
  listingTitle: 'Blog',
  emptyState: 'No posts found.',
  home: 'Home',
  blog: 'Blog',

  tagTitle: 'Tag: {value}',
  tagDescription: 'Posts tagged with "{value}"',
  categoryTitle: 'Category: {value}',
  categoryDescription: 'Posts in the "{value}" category',
  authorTitle: 'Posts by {value}',
  seriesTitle: 'Series: {value}',
  seriesDescription: 'All posts in the "{value}" series',
  seriesCount: '{count} posts in this series',
  seriesLabel: 'Series:',

  newerPosts: 'Newer posts',
  olderPosts: 'Older posts',

  backToBlog: 'Back to Blog',
  relatedPosts: 'Related Posts',
  viewAllPosts: 'View All Posts',
  readingTime: '{minutes} min read',
  share: 'Share:',
  tableOfContents: 'Table of Contents',
  seriesPart: 'Part {current} of {total}',
  previous: 'Previous',
  next: 'Next',

  rssFeed: 'RSS Feed',
};

/** Per-locale overrides, e.g. `{ es: { listingTitle: 'Blog' } }`. */
export type BlogLabelsConfig = Record<string, Partial<BlogLabels>>;

/**
 * Resolve the label set for a locale. Unspecified strings fall back to the
 * default locale's overrides, then to the English defaults — so a site can
 * translate incrementally without holes.
 */
export function resolveLabels(
  config: BlogLabelsConfig | undefined,
  locale: string,
  defaultLocale = 'en',
): BlogLabels {
  return {
    ...DEFAULT_LABELS,
    ...(config?.[defaultLocale] ?? {}),
    ...(config?.[locale] ?? {}),
  };
}

/** Substitute `{name}` placeholders. Unknown placeholders are left in place. */
export function format(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
