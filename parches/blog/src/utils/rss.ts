import type { PostEntry } from '../content/schemas.js';

interface RSSItem {
  title: string;
  description?: string;
  link: string;
  pubDate: Date;
  categories?: string[];
  author?: string;
  content?: string;
}

interface GenerateRSSOptions {
  posts: { id: string; data: PostEntry; body?: string }[];
  siteUrl: string;
  basePath?: string;
  title: string;
  description: string;
}

/**
 * Transform blog posts into RSS-compatible items.
 * Designed to be passed to @astrojs/rss's `rss()` function.
 */
export function generateRSSItems(options: GenerateRSSOptions): RSSItem[] {
  const { posts, siteUrl, basePath = 'blog' } = options;
  const base = siteUrl.replace(/\/$/, '');

  return posts.map((post) => {
    const slug = post.data.urlSlug ?? post.id;
    const item: RSSItem = {
      title: post.data.title,
      description: post.data.excerpt ?? post.data.description,
      link: `${base}/${basePath}/${slug}`,
      pubDate: post.data.publishDate,
    };

    const allTags = [...post.data.tags];
    if (post.data.category) allTags.unshift(post.data.category);
    if (allTags.length > 0) item.categories = allTags;

    if (post.data.authorName) item.author = post.data.authorName;

    if (post.body) item.content = post.body;

    return item;
  });
}
