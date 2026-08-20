import type { PostEntry } from '../content/schemas.js';

interface ScoredPost {
  id: string;
  data: PostEntry;
  score: number;
}

/**
 * Find related posts by scoring similarity.
 *
 * Scoring:
 * - Same category: +3
 * - Each shared tag: +1
 * - Same series: +2
 * - Same author: +1
 * - Recency bonus: +1 (published within 30 days)
 */
export function findRelatedPosts(
  current: { id: string; data: PostEntry },
  allPosts: { id: string; data: PostEntry }[],
  count = 3,
): { id: string; data: PostEntry }[] {
  const scored: ScoredPost[] = [];

  for (const post of allPosts) {
    if (post.id === current.id) continue;

    let score = 0;

    // Category match
    if (current.data.category && post.data.category === current.data.category) {
      score += 3;
    }

    // Shared tags
    const currentTags = new Set(current.data.tags);
    for (const tag of post.data.tags) {
      if (currentTags.has(tag)) score += 1;
    }

    // Same series
    if (current.data.series && post.data.series?.name === current.data.series.name) {
      score += 2;
    }

    // Shared author
    const currentAuthors = new Set(current.data.authors);
    for (const author of post.data.authors) {
      if (currentAuthors.has(author)) score += 1;
    }

    // Recency bonus (within 30 days)
    const daysDiff = Math.abs(
      (current.data.publishDate.getTime() - post.data.publishDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysDiff <= 30) score += 1;

    if (score > 0) {
      scored.push({ id: post.id, data: post.data, score });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score || b.data.publishDate.getTime() - a.data.publishDate.getTime())
    .slice(0, count)
    .map(({ id, data }) => ({ id, data }));
}
