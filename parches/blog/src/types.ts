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
import type { BlogLabelsConfig } from './labels.js';

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
  /** Number of related posts to show; 0 turns them off. Default: from the preset (3, or 0 for a newsletter). */
  relatedPostsCount?: number;
  /** Show draft posts in dev mode. Default: true */
  showDraftsInDev?: boolean;
  /** Enable RSS feed generation. Default: true */
  rss?: boolean;
  /** Build series pages and the part-of-a-series boxes. Default: from the preset. */
  series?: boolean;
  /**
   * How post dates are rendered, as options for `Intl.DateTimeFormat`.
   *
   * Not a token template like 'MMMM d, yyyy': that would bake English word order
   * into the config, since the same date reads "9 de marzo de 2026" in Spanish —
   * different order, and a connective. `Intl` already knows that for every
   * language, so this chooses the *style* and lets the locale choose the shape.
   *
   * Plain data, so a JSON config carries it and a CMS can edit it.
   *
   * Default: `{ year: 'numeric', month: 'short', day: 'numeric' }`.
   */
  dateFormat?: Intl.DateTimeFormatOptions;
  /**
   * UI strings keyed by locale, e.g. `{ es: { listingTitle: 'Blog' } }`.
   * Anything omitted falls back to the English defaults. See ./labels.ts.
   */
  labels?: BlogLabelsConfig;
  /**
   * The kind of publication, which sets the defaults of the keys below (see
   * BLOG_PRESETS). Any key given explicitly wins over the preset. Default:
   * 'company'.
   */
  preset?: BlogPreset;
  /**
   * 'one' for a single writer: no author pages are built, and a byline links
   * to `aboutPath`. 'many' builds a page per author.
   */
  authors?: 'one' | 'many';
  /** With `authors: 'one'`, where the writer's name links. Default: '/about'. */
  aboutPath?: string;
  /** Tag pages with fewer posts than this are `noindex`: a thin page dilutes the site. Default: 3. */
  tagIndexThreshold?: number;
}

/** A kind of publication: a starting point for the blog's structure, never a lock. */
export type BlogPreset = 'personal' | 'company' | 'magazine' | 'newsletter';

/**
 * What each preset decides. Only structure lives here (which pages exist, how
 * many related posts are looked up); how the pages look is decided by the
 * blog's views, which each preset also ships.
 */
export const BLOG_PRESETS: Record<BlogPreset, { authors: 'one' | 'many'; series: boolean; relatedPostsCount: number }> = {
  // One writer, tags, and series for long arguments told in parts.
  personal: { authors: 'one', series: true, relatedPostsCount: 3 },
  // Several writers with their own pages; categories map to the teams.
  company: { authors: 'many', series: false, relatedPostsCount: 3 },
  // Sections, many writers, series for investigations.
  magazine: { authors: 'many', series: true, relatedPostsCount: 3 },
  // One writer; every post is a numbered issue and the next one is the point.
  newsletter: { authors: 'one', series: false, relatedPostsCount: 0 },
};

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
  dateFormat: Intl.DateTimeFormatOptions;
  labels: BlogLabelsConfig;
  preset: BlogPreset;
  authors: 'one' | 'many';
  aboutPath: string;
  tagIndexThreshold: number;
}

/**
 * The blog's configuration, resolved: built-in defaults, then the preset, then
 * the keys the site gives. Components read only this, never `preset` to decide
 * anything themselves.
 */
export function resolveBlogConfig(config?: BlogConfig): ResolvedBlogConfig {
  const p = config?.permalinks ?? {};
  const preset = config?.preset ?? 'company';
  const fromPreset = BLOG_PRESETS[preset];

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
    relatedPostsCount: config?.relatedPostsCount ?? fromPreset.relatedPostsCount,
    showDraftsInDev: config?.showDraftsInDev ?? true,
    rss: config?.rss ?? true,
    series: config?.series ?? fromPreset.series,
    // The default is what the widgets already rendered, so nothing shifts until
    // a site asks it to.
    dateFormat: config?.dateFormat ?? { year: 'numeric', month: 'short', day: 'numeric' },
    labels: config?.labels ?? {},
    preset,
    authors: config?.authors ?? fromPreset.authors,
    aboutPath: config?.aboutPath ?? '/about',
    tagIndexThreshold: config?.tagIndexThreshold ?? 3,
  };
}

/**
 * Where an author's name links: their page when the blog has several writers,
 * the About page when it has one (there are no author pages then).
 */
export function resolveAuthorHref(
  config: Pick<ResolvedBlogConfig, 'authors' | 'aboutPath' | 'permalinks'>,
  author: string,
  locale?: string,
  defaultLocale?: string,
): string {
  return config.authors === 'one'
    ? localizePath(config.aboutPath, locale, defaultLocale)
    : resolveTaxonomyPermalink(config.permalinks.author, author, locale, defaultLocale);
}

/** Slugify a string for URL usage. */
function slugify(str: string): string {
  return str
    // Decompose accented letters, then drop the combining marks, so "Guías" becomes
    // "guias" rather than "gus" — \w is ASCII-only and would otherwise delete them.
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Extract the post key (without locale prefix) from a content entry ID. */
function postKeyFromId(id: string): string {
  const slashIdx = id.indexOf('/');
  return slashIdx !== -1 ? id.slice(slashIdx + 1) : id;
}

/**
 * Prefix a resolved path with the locale segment, unless it is the default locale.
 * Parche never prefixes the default locale (see core's expectedSlugFor), so this
 * mirrors that rule for every link the blog generates.
 */
export function localizePath(path: string, locale?: string, defaultLocale?: string): string {
  if (!locale || !defaultLocale || locale === defaultLocale) return path;
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Resolve a post permalink from pattern + post data. */
export function resolvePostPermalink(
  pattern: string,
  post: { id: string; data: { urlSlug?: string; publishDate: Date; category?: string; authors?: string[] } },
  locale?: string,
  defaultLocale?: string,
): string {
  const d = post.data.publishDate;
  const pad = (n: number) => String(n).padStart(2, '0');

  const path = pattern
    .replace(/%slug%/g, post.data.urlSlug ?? postKeyFromId(post.id))
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

/** Resolve a taxonomy permalink (tag, category, author, series). */
export function resolveTaxonomyPermalink(
  pattern: string,
  value: string,
  locale?: string,
  defaultLocale?: string,
): string {
  const path = pattern
    .replace(/%tag%/g, value.toLowerCase())
    .replace(/%category%/g, value.toLowerCase())
    .replace(/%author%/g, value.toLowerCase())
    .replace(/%series%/g, value.toLowerCase().replace(/\s+/g, '-'));

  return localizePath(path, locale, defaultLocale);
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
