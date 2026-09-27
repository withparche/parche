import { localizePath, resolvePostPermalink, resolveTaxonomyPermalink, type ResolvedBlogConfig } from '../types.js';

/**
 * Where a development tool shows a blog document: a post at its permalink,
 * a view at the first page that renders it (the listing, the first category,
 * the first writer…). Pure: it gets the config and what the site has.
 */
export interface PostLike {
  id: string;
  data: { urlSlug?: string; publishDate?: string | Date; category?: string; tags?: string[]; authors?: string[]; series?: { name: string } };
}

const localeOf = (id: string, locales: string[], fallback: string) => (id.includes('/') && locales.includes(id.split('/')[0]) ? id.split('/')[0] : fallback);

export function postPath(config: Pick<ResolvedBlogConfig, 'permalinks'>, post: PostLike, locales: string[], defaultLocale: string): string {
  const date = post.data.publishDate ? new Date(post.data.publishDate) : new Date();
  return resolvePostPermalink(config.permalinks.post, { id: post.id, data: { ...post.data, publishDate: Number.isNaN(date.getTime()) ? new Date() : date } }, localeOf(post.id, locales, defaultLocale), defaultLocale);
}

/** The first page each view renders, in the default locale; null when the blog builds no such page. */
export function viewPaths(config: ResolvedBlogConfig, posts: PostLike[], views: string[], defaultLocale: string): Record<string, string | null> {
  const inDefault = posts.filter((p) => !p.id.includes('/') || p.id.startsWith(`${defaultLocale}/`));
  const first = <T>(pick: (p: PostLike) => T | undefined) => inDefault.map(pick).find((v) => v !== undefined && v !== '');
  const category = first((p) => p.data.category);
  const tag = first((p) => p.data.tags?.[0]);
  const author = first((p) => p.data.authors?.[0]);
  const series = first((p) => p.data.series?.name);
  const out: Record<string, string | null> = {};
  for (const view of views) {
    out[view] =
      view === 'index' ? config.permalinks.listing
      : view === 'post' ? (inDefault[0] ? postPath(config, inDefault[0], [], defaultLocale) : null)
      : view === 'taxonomy' ? (category ? resolveTaxonomyPermalink(config.permalinks.category, category) : tag ? resolveTaxonomyPermalink(config.permalinks.tag, tag) : null)
      : view === 'author' ? (config.authors === 'many' && author ? resolveTaxonomyPermalink(config.permalinks.author, author) : null)
      : view === 'series' ? (config.series && series ? resolveTaxonomyPermalink(config.permalinks.series, series) : null)
      : view === 'archive' ? (config.archive ? config.permalinks.archive : null)
      : view === 'subscribe' ? (config.subscribe ? config.subscribe.path : null)
      : view === 'search' ? (config.search ? config.search.path : null)
      : null;
    if (out[view]) out[view] = localizePath(out[view]!, defaultLocale, defaultLocale);
  }
  return out;
}
