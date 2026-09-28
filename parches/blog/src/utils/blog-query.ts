/**
 * Runtime blog query utilities.
 *
 * In static mode, Astro's `getStaticPaths` + `paginate()` provides page data
 * via `Astro.props.page`. In SSR mode, `getStaticPaths` is ignored and we
 * need to query posts at request time.
 *
 * These helpers provide a unified pagination interface for both modes. Every
 * query answers from the index (utils/posts.ts): the posts read and sorted
 * once, a post found by its address, a listing filtered from a list that is
 * already in order. Without a locale, a query covers every locale.
 */
import { postIndex } from './posts.js';
import { hasTag, inCategory, byAuthor, inSeries, bySeriesOrder } from './post-helpers.js';

export interface PageData<T = any> {
  data: T[];
  currentPage: number;
  lastPage: number;
  total: number;
  url: {
    prev: string | undefined;
    next: string | undefined;
  };
}

function paginateArray<T>(items: T[], page: number, pageSize: number, baseUrl: string): PageData<T> {
  const total = items.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), lastPage);
  const start = (currentPage - 1) * pageSize;
  const data = items.slice(start, start + pageSize);

  return {
    data,
    currentPage,
    lastPage,
    total,
    url: {
      prev: currentPage > 1 ? `${baseUrl}${currentPage - 1 === 1 ? '' : `/${currentPage - 1}`}` : undefined,
      next: currentPage < lastPage ? `${baseUrl}/${currentPage + 1}` : undefined,
    },
  };
}

async function published(locale?: string, showDrafts = false) {
  return (await postIndex(showDrafts)).published(locale);
}

/* ------------------------------------------------------------------ */
/*  Query functions for each route type                               */
/* ------------------------------------------------------------------ */

export async function queryBlogListing(opts: {
  locale?: string;
  page?: number;
  pageSize?: number;
  showDrafts?: boolean;
  baseUrl?: string;
}): Promise<PageData> {
  const posts = await published(opts.locale, opts.showDrafts);
  return paginateArray(posts, opts.page ?? 1, opts.pageSize ?? 12, opts.baseUrl ?? '/blog');
}

export async function queryPostsByTag(opts: {
  tag: string;
  locale?: string;
  page?: number;
  pageSize?: number;
  showDrafts?: boolean;
  baseUrl?: string;
}): Promise<PageData> {
  const posts = (await published(opts.locale, opts.showDrafts)).filter(hasTag(opts.tag));
  return paginateArray(posts, opts.page ?? 1, opts.pageSize ?? 12, opts.baseUrl ?? '/blog/tag/' + opts.tag.toLowerCase());
}

export async function queryPostsByCategory(opts: {
  category: string;
  locale?: string;
  page?: number;
  pageSize?: number;
  showDrafts?: boolean;
  baseUrl?: string;
}): Promise<PageData> {
  const posts = (await published(opts.locale, opts.showDrafts)).filter(inCategory(opts.category));
  return paginateArray(posts, opts.page ?? 1, opts.pageSize ?? 12, opts.baseUrl ?? '/blog/category/' + opts.category.toLowerCase());
}

export async function queryPostsByAuthor(opts: {
  authorKey: string;
  locale?: string;
  page?: number;
  pageSize?: number;
  showDrafts?: boolean;
  baseUrl?: string;
}): Promise<PageData> {
  const posts = (await published(opts.locale, opts.showDrafts)).filter(byAuthor(opts.authorKey));
  return paginateArray(posts, opts.page ?? 1, opts.pageSize ?? 12, opts.baseUrl ?? '/blog/author/' + opts.authorKey.toLowerCase());
}

export async function queryPostsBySeries(opts: {
  seriesName: string;
  locale?: string;
  showDrafts?: boolean;
}): Promise<any[]> {
  return (await published(opts.locale, opts.showDrafts)).filter(inSeries(opts.seriesName)).sort(bySeriesOrder);
}

/**
 * The post served at `slug`: in `locale`, a lookup; without one, the first
 * of any locale at that address.
 */
export async function querySinglePost(opts: {
  slug: string;
  locale?: string;
  showDrafts?: boolean;
}) {
  const index = await postIndex(opts.showDrafts);
  const published = index.published(opts.locale);
  const post = opts.locale
    ? index.bySlug(opts.slug, opts.locale)
    : published.find((p) => (p.data.urlSlug ?? p.id.slice(p.id.indexOf('/') + 1)) === opts.slug);

  return { post, allPosts: published };
}

/**
 * Resolve all unique tags for a locale (SSR mode).
 */
export async function queryAllTags(locale?: string, showDrafts = false) {
  return (await postIndex(showDrafts)).terms(locale).tags;
}

/**
 * Resolve all unique categories for a locale (SSR mode).
 */
export async function queryAllCategories(locale?: string, showDrafts = false) {
  return (await postIndex(showDrafts)).terms(locale).categories;
}

/**
 * Resolve all unique series for a locale (SSR mode).
 */
export async function queryAllSeries(locale?: string, showDrafts = false) {
  return (await postIndex(showDrafts)).terms(locale).series;
}
