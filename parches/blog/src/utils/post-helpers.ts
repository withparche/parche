import type { PostEntry } from '../content/schemas.js';

type Post = { id: string; data: PostEntry };

/**
 * Extract locale and post key from a content entry ID.
 * ID format: '{locale}/{postKey}' (e.g. 'en/my-post' → { locale: 'en', postKey: 'my-post' })
 * Falls back to defaultLocale if no locale prefix is found.
 */
export function extractPostLocale(id: string, defaultLocale = 'en'): { locale: string; postKey: string } {
  const parts = id.split('/');
  if (parts.length > 1) {
    return { locale: parts[0], postKey: parts.slice(1).join('/') };
  }
  return { locale: defaultLocale, postKey: id };
}

/**
 * Filter and sort published posts (exclude drafts in production).
 * Optionally filter by locale.
 */
export function getPublishedPosts(posts: Post[], showDrafts = false, locale?: string): Post[] {
  return posts
    .filter((post) => showDrafts || !post.data.draft)
    .filter((post) => !locale || extractPostLocale(post.id).locale === locale)
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
}

/**
 * Get featured posts, sorted by publish date.
 */
export function getFeaturedPosts(posts: Post[], showDrafts = false, locale?: string): Post[] {
  return getPublishedPosts(posts, showDrafts, locale).filter((post) => post.data.featured);
}

/**
 * Get posts filtered by tag.
 */
export function getPostsByTag(posts: Post[], tag: string, showDrafts = false, locale?: string): Post[] {
  return getPublishedPosts(posts, showDrafts, locale).filter((post) =>
    post.data.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
  );
}

/**
 * Get posts filtered by category.
 */
export function getPostsByCategory(posts: Post[], category: string, showDrafts = false, locale?: string): Post[] {
  return getPublishedPosts(posts, showDrafts, locale).filter(
    (post) => post.data.category?.toLowerCase() === category.toLowerCase(),
  );
}

/**
 * Get posts filtered by author slug.
 */
export function getPostsByAuthor(posts: Post[], author: string, showDrafts = false, locale?: string): Post[] {
  return getPublishedPosts(posts, showDrafts, locale).filter((post) =>
    post.data.authors.some((a) => a.toLowerCase() === author.toLowerCase()),
  );
}

/**
 * Get posts in a series, sorted by series order.
 */
export function getPostsBySeries(posts: Post[], seriesName: string, showDrafts = false, locale?: string): Post[] {
  return getPublishedPosts(posts, showDrafts, locale)
    .filter((post) => post.data.series?.name === seriesName)
    .sort((a, b) => (a.data.series!.order - b.data.series!.order));
}

/**
 * Extract all unique tags from posts with counts.
 */
export function getAllTags(posts: Post[], showDrafts = false, locale?: string): Map<string, number> {
  const tags = new Map<string, number>();
  for (const post of getPublishedPosts(posts, showDrafts, locale)) {
    for (const tag of post.data.tags) {
      tags.set(tag, (tags.get(tag) ?? 0) + 1);
    }
  }
  return tags;
}

/**
 * Extract all unique categories from posts with counts.
 */
export function getAllCategories(posts: Post[], showDrafts = false, locale?: string): Map<string, number> {
  const categories = new Map<string, number>();
  for (const post of getPublishedPosts(posts, showDrafts, locale)) {
    if (post.data.category) {
      categories.set(post.data.category, (categories.get(post.data.category) ?? 0) + 1);
    }
  }
  return categories;
}

/**
 * Extract all unique series names.
 */
export function getAllSeries(posts: Post[], showDrafts = false, locale?: string): string[] {
  const series = new Set<string>();
  for (const post of getPublishedPosts(posts, showDrafts, locale)) {
    if (post.data.series) {
      series.add(post.data.series.name);
    }
  }
  return [...series];
}
