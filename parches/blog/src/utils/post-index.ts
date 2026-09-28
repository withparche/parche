/**
 * The posts, prepared once: which are published, in what order, at which
 * address, and which are translations of which. Every question the routes,
 * the resolver and the views ask is answered from here by a lookup, so what
 * a post costs does not depend on how many posts there are.
 *
 * Pure: built from a list of entries, so it is tested without Astro. The
 * module that reads the collection and keeps the index is utils/posts.ts.
 */
import type { PostEntry } from '../content/schemas.js';
import { extractPostLocale, getPublishedPosts } from './post-helpers.js';

export type Post = { id: string; data: PostEntry; body?: string };

export interface PostIndex {
  /** Every published post, newest first, all locales. */
  all: Post[];
  /** A locale's published posts, newest first; every locale's without one. */
  published(locale?: string): Post[];
  /** The post served at `slug` in `locale`: its `urlSlug`, else its key (the file name). */
  bySlug(slug: string, locale: string): Post | undefined;
  /** A post's translations by locale, itself included, in the locales that publish it. */
  translations(key: string): Array<{ locale: string; post: Post }>;
  /** A locale's tags and categories with how many posts carry each, and its series; every locale's without one. */
  terms(locale?: string): { tags: Map<string, number>; categories: Map<string, number>; series: string[] };
}

export function buildPostIndex(posts: Post[], defaultLocale: string, showDrafts = false): PostIndex {
  // Newest first, so the first post at an address is the one a scan found.
  const all = getPublishedPosts(posts, showDrafts);
  const byLocale = new Map<string, Post[]>();
  const byAddress = new Map<string, Post>();
  const byKey = new Map<string, Array<{ locale: string; post: Post }>>();
  for (const post of all) {
    const { locale, postKey } = extractPostLocale(post.id, defaultLocale);
    (byLocale.get(locale) ?? byLocale.set(locale, []).get(locale)!).push(post);
    const address = `${locale}/${post.data.urlSlug ?? postKey}`;
    if (!byAddress.has(address)) byAddress.set(address, post);
    (byKey.get(postKey) ?? byKey.set(postKey, []).get(postKey)!).push({ locale, post });
  }

  const published = (locale?: string) => (locale === undefined ? all : (byLocale.get(locale) ?? []));

  const termsByLocale = new Map<string, ReturnType<PostIndex['terms']>>();
  const terms = (locale?: string) => {
    let t = termsByLocale.get(locale ?? '*');
    if (t) return t;
    const tags = new Map<string, number>();
    const categories = new Map<string, number>();
    const series = new Set<string>();
    for (const post of published(locale)) {
      for (const tag of post.data.tags ?? []) tags.set(tag, (tags.get(tag) ?? 0) + 1);
      if (post.data.category) categories.set(post.data.category, (categories.get(post.data.category) ?? 0) + 1);
      if (post.data.series) series.add(post.data.series.name);
    }
    t = { tags, categories, series: [...series] };
    termsByLocale.set(locale ?? '*', t);
    return t;
  };

  return {
    all,
    published,
    bySlug: (slug, locale) => byAddress.get(`${locale}/${slug}`),
    translations: (key) => byKey.get(key) ?? [],
    terms,
  };
}
