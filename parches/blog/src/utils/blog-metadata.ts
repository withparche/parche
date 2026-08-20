import type { PostEntry } from '../content/schemas.js';

interface BlogPostingOptions {
  post: PostEntry;
  url: string;
  siteUrl: string;
  authorName?: string;
  authorUrl?: string;
}

/**
 * Generate JSON-LD BlogPosting structured data.
 * Designed to be merged into the site's existing @graph array.
 */
export function generateBlogPostingJsonLd(options: BlogPostingOptions): Record<string, unknown> {
  const { post, url, siteUrl, authorName, authorUrl } = options;

  const jsonLd: Record<string, unknown> = {
    '@type': 'BlogPosting',
    headline: post.metadata?.title ?? post.title,
    description: post.metadata?.description ?? post.description,
    url,
    datePublished: post.publishDate.toISOString(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  if (post.modifiedDate) {
    jsonLd.dateModified = post.modifiedDate.toISOString();
  }

  if (post.image) {
    jsonLd.image = {
      '@type': 'ImageObject',
      url: post.image.src.startsWith('http') ? post.image.src : `${siteUrl.replace(/\/$/, '')}${post.image.src}`,
      ...(post.image.alt ? { caption: post.image.alt } : {}),
    };
  }

  if (authorName) {
    jsonLd.author = {
      '@type': 'Person',
      name: authorName,
      ...(authorUrl ? { url: authorUrl } : {}),
    };
  }

  if (post.tags.length > 0) {
    jsonLd.keywords = post.tags.join(', ');
  }

  if (post.category) {
    jsonLd.articleSection = post.category;
  }

  if (post.readingTime) {
    jsonLd.timeRequired = `PT${post.readingTime}M`;
  }

  return jsonLd;
}

/**
 * Generate JSON-LD BreadcrumbList for blog post pages.
 */
export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
