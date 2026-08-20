/**
 * Runtime blog query utilities.
 *
 * In static mode, Astro's `getStaticPaths` + `paginate()` provides page data
 * via `Astro.props.page`. In SSR mode, `getStaticPaths` is ignored and we
 * need to query posts at request time.
 *
 * These helpers provide a unified pagination interface for both modes.
 */
import { getCollection } from 'astro:content';
import { getPublishedPosts, getPostsByTag, getPostsByCategory, getPostsByAuthor, getPostsBySeries, getAllTags, getAllCategories, getAllSeries, extractPostLocale } from './post-helpers.js';

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

async function fetchPublishedPosts(locale?: string, showDrafts = false) {
  const allPosts = await getCollection('posts');
  return getPublishedPosts(allPosts, showDrafts, locale);
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
  const posts = await fetchPublishedPosts(opts.locale, opts.showDrafts);
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
  const allPosts = await getCollection('posts');
  const posts = getPostsByTag(allPosts, opts.tag, opts.showDrafts, opts.locale);
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
  const allPosts = await getCollection('posts');
  const posts = getPostsByCategory(allPosts, opts.category, opts.showDrafts, opts.locale);
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
  const allPosts = await getCollection('posts');
  const posts = getPostsByAuthor(allPosts, opts.authorKey, opts.showDrafts, opts.locale);
  return paginateArray(posts, opts.page ?? 1, opts.pageSize ?? 12, opts.baseUrl ?? '/blog/author/' + opts.authorKey.toLowerCase());
}

export async function queryPostsBySeries(opts: {
  seriesName: string;
  locale?: string;
  showDrafts?: boolean;
}): Promise<any[]> {
  const allPosts = await getCollection('posts');
  return getPostsBySeries(allPosts, opts.seriesName, opts.showDrafts, opts.locale);
}

export async function querySinglePost(opts: {
  slug: string;
  locale?: string;
  showDrafts?: boolean;
}) {
  const allPosts = await getCollection('posts');
  const published = getPublishedPosts(allPosts, opts.showDrafts, opts.locale);

  const post = published.find((p) => {
    const { postKey } = extractPostLocale(p.id);
    return (p.data.urlSlug ?? postKey) === opts.slug;
  });

  return { post, allPosts: published };
}

/**
 * Resolve all unique tags for a locale (SSR mode).
 */
export async function queryAllTags(locale?: string, showDrafts = false) {
  const allPosts = await getCollection('posts');
  return getAllTags(allPosts, showDrafts, locale);
}

/**
 * Resolve all unique categories for a locale (SSR mode).
 */
export async function queryAllCategories(locale?: string, showDrafts = false) {
  const allPosts = await getCollection('posts');
  return getAllCategories(allPosts, showDrafts, locale);
}

/**
 * Resolve all unique series for a locale (SSR mode).
 */
export async function queryAllSeries(locale?: string, showDrafts = false) {
  const allPosts = await getCollection('posts');
  return getAllSeries(allPosts, showDrafts, locale);
}
