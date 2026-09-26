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
  /** Beside the pagination. Placeholders: {current}, {last}, {total}. */
  pageSummary: string;
  /** Eyebrows over a tag, category or author page's title. */
  tagLabel: string;
  categoryLabel: string;
  authorLabel: string;
  /** The word before a row of topics, and the chip back to everything. */
  tagsLabel: string;
  categoriesLabel: string;
  allLabel: string;
  /** Over the featured post. */
  featuredLabel: string;
  /** A magazine's word for its categories. */
  sectionsLabel: string;
  /** A newsletter's featured post. */
  latestIssueLabel: string;
  /** How many posts a tag, category or author has. Placeholder: {count}. */
  postsCount: string;
  /** The load-more button, while it loads, and what it announces. Placeholder: {n}. */
  loadMore: string;
  loading: string;
  loadedMore: string;
  /** Article page. Placeholders: {part}, {total}, {series}, {date}, {name}. */
  readNext: string;
  onThisPage: string;
  copyLink: string;
  shareAction: string;
  seriesEyebrow: string;
  previously: string;
  nextInSeries: string;
  publishes: string;
  writtenBy: string;
  moreFrom: string;
  /** Series and author pages. Placeholders: {published}, {total}, {n}, {date}. */
  seriesPublished: string;
  seriesDue: string;
  seriesComplete: string;
  seriesFollow: string;
  writingTitle: string;
  otherWriters: string;
  /** The archive. Placeholders: {total}, {count}. */
  archiveTitle: string;
  archiveSubtitle: string;
  archiveEarlier: string;
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
  pageSummary: 'Page {current} of {last} · {total} posts',
  tagLabel: 'Tag',
  categoryLabel: 'Category',
  authorLabel: 'Author',
  tagsLabel: 'Tags',
  categoriesLabel: 'Categories',
  allLabel: 'All',
  featuredLabel: 'Featured',
  sectionsLabel: 'Sections',
  latestIssueLabel: 'Latest issue',
  postsCount: '{count} posts',
  loadMore: 'Load more',
  loading: 'Loading…',
  loadedMore: '{n} more loaded',
  readNext: 'Read next',
  onThisPage: 'On this page',
  copyLink: 'Copy link',
  shareAction: 'Share',
  seriesEyebrow: 'Series · Part {part} of {total}',
  previously: 'Previously',
  nextInSeries: 'Next in {series}',
  publishes: 'Publishes {date}',
  writtenBy: 'Written by {name}',
  moreFrom: 'More from {name}',
  seriesPublished: 'Series · {published} of {total} published',
  seriesDue: 'Ongoing · part {n} due {date}',
  seriesComplete: 'Complete',
  seriesFollow: 'Upcoming parts are listed with their date, so readers know the series is alive.',
  writingTitle: 'Writing',
  otherWriters: 'Other writers',
  archiveTitle: 'Archive',
  archiveSubtitle: 'Everything, by month. {total} posts in total.',
  archiveEarlier: 'Earlier',
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
