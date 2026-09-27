import type { PostEntry } from '../content/schemas.js';

interface BlogPostingOptions {
  post: PostEntry;
  url: string;
  siteUrl: string;
  authorName?: string;
  authorUrl?: string;
  /** 'NewsArticle' for a magazine; a blog post otherwise. */
  type?: 'BlogPosting' | 'NewsArticle';
}

/**
 * Generate JSON-LD BlogPosting structured data.
 * Designed to be merged into the site's existing @graph array.
 */
export function generateBlogPostingJsonLd(options: BlogPostingOptions): Record<string, unknown> {
  const { post, url, siteUrl, authorName, authorUrl, type = 'BlogPosting' } = options;

  const jsonLd: Record<string, unknown> = {
    '@type': type,
    headline: post.metadata?.title ?? post.title,
    description: post.metadata?.description ?? post.description ?? post.excerpt,
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
 * An ItemList of a page's entries, in order, with their position: the posts
 * of a listing or a term, the parts of a series. Entries without a URL (an
 * announced part) are listed by name.
 */
export function generateItemListJsonLd(items: { name: string; url?: string }[], siteUrl: string): Record<string, unknown> {
  const base = siteUrl.replace(/\/$/, '');
  return {
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.url ? { url: it.url.startsWith('http') ? it.url : `${base}${it.url}` } : {}),
    })),
  };
}

/** A writer, for an author page (ProfilePage): name, role, bio, portrait and their profiles as sameAs. */
export function generatePersonJsonLd(p: { name: string; role?: string; bio?: string; image?: string; url: string; sameAs: string[] }, siteUrl: string): Record<string, unknown> {
  const abs = (u: string) => (u.startsWith('http') ? u : `${siteUrl.replace(/\/$/, '')}${u}`);
  return {
    '@type': 'Person',
    name: p.name,
    url: abs(p.url),
    ...(p.role ? { jobTitle: p.role } : {}),
    ...(p.bio ? { description: p.bio } : {}),
    ...(p.image ? { image: abs(p.image) } : {}),
    ...(p.sameAs.length ? { sameAs: p.sameAs } : {}),
  };
}
