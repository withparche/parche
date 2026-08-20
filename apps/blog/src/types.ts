/**
 * Permalink patterns with variable substitution.
 *
 * Variables are wrapped in %…% and resolved at build time from post data.
 *
 * Post permalink variables:
 *   %slug%      — urlSlug ?? entry id
 *   %year%      — publish year (4 digits)
 *   %month%     — publish month (2 digits)
 *   %day%       — publish day (2 digits)
 *   %hour%      — publish hour (2 digits)
 *   %minute%    — publish minute (2 digits)
 *   %second%    — publish second (2 digits)
 *   %category%  — category (lowercased, slugified) or 'uncategorized'
 *   %author%    — first author slug or 'anonymous'
 *
 * Tag/Category/Author/Series permalink variables:
 *   %tag%       — tag slug
 *   %category%  — category slug
 *   %author%    — author slug
 *   %series%    — series slug
 *
 * Examples:
 *   post:     '/blog/%slug%'                     → /blog/my-post
 *   post:     '/%year%/%month%/%slug%'            → /2026/03/my-post
 *   post:     '/%category%/%slug%'                → /tutorials/my-post
 *   tag:      '/tag/%tag%'                        → /tag/javascript
 *   category: '/blog/category/%category%'         → /blog/category/tutorials
 *   listing:  '/blog'                             → /blog
 */
export interface BlogPermalinks {
  /** Blog listing page. Default: '/blog' */
  listing?: string;
  /**
   * Single post permalink pattern.
   * Variables: %slug%, %year%, %month%, %day%, %hour%, %minute%, %second%, %category%, %author%
   * Default: '/blog/%slug%'
   */
  post?: string;
  /**
   * Tag listing permalink pattern.
   * Variables: %tag%
   * Default: '/blog/tag/%tag%'
   */
  tag?: string;
  /**
   * Category listing permalink pattern.
   * Variables: %category%
   * Default: '/blog/category/%category%'
   */
  category?: string;
  /**
   * Author listing permalink pattern.
   * Variables: %author%
   * Default: '/blog/author/%author%'
   */
  author?: string;
  /**
   * Series listing permalink pattern.
   * Variables: %series%
   * Default: '/blog/series/%series%'
   */
  series?: string;
  /** RSS feed path. Default: '/rss.xml' */
  rss?: string;
}

export interface BlogConfig {
  /** Permalink patterns for each route type */
  permalinks?: BlogPermalinks;
  /** Posts per page in listings. Default: 12 */
  postsPerPage?: number;
  /** Enable reading time calculation. Default: true */
  readingTime?: boolean;
  /** Words per minute for reading time. Default: 200 */
  wordsPerMinute?: number;
  /** Number of related posts to show. Default: 3 */
  relatedPostsCount?: number;
  /** Show draft posts in dev mode. Default: true */
  showDraftsInDev?: boolean;
  /** Enable RSS feed generation. Default: true */
  rss?: boolean;
  /** Enable series/collections. Default: false */
  series?: boolean;
  /** Date format string. Default: 'MMMM d, yyyy' */
  dateFormat?: string;
}

export interface ResolvedPermalinks {
  listing: string;
  post: string;
  tag: string;
  category: string;
  author: string;
  series: string;
  rss: string;
}

export interface ResolvedBlogConfig {
  permalinks: ResolvedPermalinks;
  postsPerPage: number;
  readingTime: boolean;
  wordsPerMinute: number;
  relatedPostsCount: number;
  showDraftsInDev: boolean;
  rss: boolean;
  series: boolean;
  dateFormat: string;
}

export function resolveBlogConfig(config?: BlogConfig): ResolvedBlogConfig {
  const p = config?.permalinks ?? {};

  return {
    permalinks: {
      listing: p.listing ?? '/blog',
      post: p.post ?? '/blog/%slug%',
      tag: p.tag ?? '/blog/tag/%tag%',
      category: p.category ?? '/blog/category/%category%',
      author: p.author ?? '/blog/author/%author%',
      series: p.series ?? '/blog/series/%series%',
      rss: p.rss ?? '/rss.xml',
    },
    postsPerPage: config?.postsPerPage ?? 12,
    readingTime: config?.readingTime ?? true,
    wordsPerMinute: config?.wordsPerMinute ?? 200,
    relatedPostsCount: config?.relatedPostsCount ?? 3,
    showDraftsInDev: config?.showDraftsInDev ?? true,
    rss: config?.rss ?? true,
    series: config?.series ?? false,
    dateFormat: config?.dateFormat ?? 'MMMM d, yyyy',
  };
}

/** Slugify a string for URL usage. */
function slugify(str: string): string {
  return str.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

/** Extract the post key (without locale prefix) from a content entry ID. */
function postKeyFromId(id: string): string {
  const slashIdx = id.indexOf('/');
  return slashIdx !== -1 ? id.slice(slashIdx + 1) : id;
}

/** Resolve a post permalink from pattern + post data. */
export function resolvePostPermalink(
  pattern: string,
  post: { id: string; data: { urlSlug?: string; publishDate: Date; category?: string; authors?: string[] } },
): string {
  const d = post.data.publishDate;
  const pad = (n: number) => String(n).padStart(2, '0');

  return pattern
    .replace(/%slug%/g, post.data.urlSlug ?? postKeyFromId(post.id))
    .replace(/%year%/g, String(d.getFullYear()))
    .replace(/%month%/g, pad(d.getMonth() + 1))
    .replace(/%day%/g, pad(d.getDate()))
    .replace(/%hour%/g, pad(d.getHours()))
    .replace(/%minute%/g, pad(d.getMinutes()))
    .replace(/%second%/g, pad(d.getSeconds()))
    .replace(/%category%/g, post.data.category ? slugify(post.data.category) : 'uncategorized')
    .replace(/%author%/g, post.data.authors?.[0] ? slugify(post.data.authors[0]) : 'anonymous');
}

/** Resolve a taxonomy permalink (tag, category, author, series). */
export function resolveTaxonomyPermalink(pattern: string, value: string): string {
  return pattern
    .replace(/%tag%/g, value.toLowerCase())
    .replace(/%category%/g, value.toLowerCase())
    .replace(/%author%/g, value.toLowerCase())
    .replace(/%series%/g, value.toLowerCase().replace(/\s+/g, '-'));
}

/**
 * Convert a permalink pattern into an Astro route pattern.
 * e.g. '/blog/%slug%' → 'blog/[slug]'
 *      '/%year%/%month%/%slug%' → '[year]/[month]/[slug]'
 *      '/blog/tag/%tag%' → 'blog/tag/[tag]'
 */
export function permalinkToRoutePattern(permalink: string): string {
  return permalink
    .replace(/^\//, '')        // strip leading slash
    .replace(/%slug%/g, '[slug]')
    .replace(/%tag%/g, '[tag]')
    .replace(/%category%/g, '[category]')
    .replace(/%author%/g, '[author]')
    .replace(/%series%/g, '[series]')
    .replace(/%year%/g, '[year]')
    .replace(/%month%/g, '[month]')
    .replace(/%day%/g, '[day]')
    .replace(/%hour%/g, '[hour]')
    .replace(/%minute%/g, '[minute]')
    .replace(/%second%/g, '[second]');
}
