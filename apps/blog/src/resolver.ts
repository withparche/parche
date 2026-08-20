/**
 * Blog content resolver.
 *
 * Used by the core catch-all route when blog posts are served at root level
 * (e.g. permalink: '/%slug%'). The catch-all calls resolve() before trying
 * to resolve as a page, enabling fallthrough.
 *
 * Exports:
 *   resolve(slug, locale, opts) — find and prepare a single blog post
 *   getPaths(locales, defaultLocale, opts) — enumerate all post slugs for static mode
 */
import { getCollection, getEntry } from 'astro:content';
import { getPublishedPosts, getPostsBySeries, extractPostLocale } from './utils/post-helpers.js';
import { querySinglePost } from './utils/blog-query.js';
import { calculateReadingTime } from './utils/reading-time.js';
import { findRelatedPosts } from './utils/related-posts.js';
import { extractTOC } from './utils/toc.js';
import { generateBlogPostingJsonLd, generateBreadcrumbJsonLd } from './utils/blog-metadata.js';
import { resolvePostPermalink, resolveTaxonomyPermalink } from './types.js';

interface ResolveOptions {
  showDrafts?: boolean;
  siteUrl?: string;
  siteName?: string;
}

interface ResolvedPost {
  /** Template name to render (from templateMap) */
  template: string;
  /** Layout name */
  layout: string;
  /** Content collection name */
  collection: string;
  /** Entry ID for rendering markdown */
  entryId: string;
  /** Props to pass to the template component */
  templateProps: Record<string, any>;
  /** Resolved metadata for BaseLayout */
  metadata: Record<string, any>;
  /** Additional components to render after the template (related posts, series nav) */
  extras: {
    seriesNav?: { seriesName: string; posts: any[]; currentOrder: number };
    relatedPosts?: any[];
  };
}

/**
 * Try to resolve a slug as a blog post.
 * Returns null if no post matches — the catch-all should then try pages.
 */
export async function resolve(
  slug: string,
  locale: string,
  opts: ResolveOptions = {},
): Promise<ResolvedPost | null> {
  // Load blog config at runtime
  const blogConfigModule = await import('parche:app/blog');
  const cfg = blogConfigModule.default as any;
  const permalinks = cfg.permalinks;

  const { post, allPosts } = await querySinglePost({
    slug,
    locale,
    showDrafts: opts.showDrafts,
  });

  if (!post) return null;

  // Reading time
  const rt = cfg.readingTime
    ? calculateReadingTime(post.body ?? '', cfg.wordsPerMinute)
    : null;
  const readingTime = post.data.readingTime ?? rt?.minutes;

  // Resolve authors
  const authorData: any[] = [];
  for (const authorSlug of post.data.authors) {
    try {
      const author =
        (await getEntry('authors', `${locale}/${authorSlug}`)) ??
        (await getEntry('authors', authorSlug as any));
      if (author) authorData.push(author.data);
    } catch {
      /* author not found */
    }
  }
  if (authorData.length === 0 && post.data.authorName) {
    authorData.push({ name: post.data.authorName });
  }

  // Related posts
  const localePosts = allPosts.filter((p) => extractPostLocale(p.id).locale === locale);
  const related = findRelatedPosts(post, localePosts, cfg.relatedPostsCount ?? 3);

  // Series navigation
  const seriesPosts = post.data.series
    ? getPostsBySeries(allPosts, post.data.series.name, opts.showDrafts, locale).map((p) => ({
        title: p.data.title,
        href: resolvePostPermalink(permalinks.post, p),
        order: p.data.series!.order,
      }))
    : [];

  // JSON-LD
  const siteUrl = opts.siteUrl ?? '';
  const siteName = opts.siteName ?? '';
  const base = siteUrl.replace(/\/$/, '');
  const pageUrl = `${base}${resolvePostPermalink(permalinks.post, post)}`;

  const blogPostingJsonLd = generateBlogPostingJsonLd({
    post: { ...post.data, readingTime },
    url: pageUrl,
    siteUrl,
    authorName: authorData[0]?.name,
  });
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: siteUrl || '/' },
    { name: 'Blog', url: `${base}${permalinks.listing}` },
    ...(post.data.category
      ? [{ name: post.data.category, url: `${base}${resolveTaxonomyPermalink(permalinks.category, post.data.category)}` }]
      : []),
    { name: post.data.title, url: pageUrl },
  ]);

  const postData = { ...post.data, readingTime };

  return {
    template: post.data.template || 'blog-post',
    layout: post.data.layout || 'default',
    collection: 'posts',
    entryId: post.id,
    templateProps: {
      data: postData,
      authorData,
      tocItems: [], // TOC gets resolved by catch-all after rendering
      permalinks,
    },
    metadata: {
      title: `${post.data.metadata?.title ?? post.data.title} — ${siteName}`,
      description: post.data.metadata?.description ?? post.data.description ?? post.data.excerpt,
      canonical: post.data.metadata?.canonical,
      noindex: post.data.metadata?.noindex ?? post.data.draft ?? false,
      nofollow: post.data.metadata?.nofollow ?? false,
      ogType: 'article' as const,
      ogTitle: post.data.metadata?.ogTitle ?? post.data.title,
      ogDescription: post.data.metadata?.ogDescription ?? post.data.description,
      ogImage: post.data.metadata?.ogImage ?? post.data.image?.src,
      twitterCard: post.data.metadata?.twitterCard ?? ('summary_large_image' as const),
      article: {
        author: authorData[0]?.name,
        publishedDate: post.data.publishDate.toISOString(),
        modifiedDate: post.data.modifiedDate?.toISOString(),
        section: post.data.category,
        tags: post.data.tags,
      },
      jsonLd: [blogPostingJsonLd, breadcrumbJsonLd],
    },
    extras: {
      seriesNav:
        post.data.series && seriesPosts.length > 1
          ? { seriesName: post.data.series.name, posts: seriesPosts, currentOrder: post.data.series.order }
          : undefined,
      relatedPosts:
        related.length > 0
          ? related.map((r) => ({
              title: r.data.title,
              description: r.data.description ?? r.data.excerpt,
              href: resolvePostPermalink(permalinks.post, r),
              image: r.data.image,
              publishDate: r.data.publishDate,
              category: r.data.category,
              tags: r.data.tags,
            }))
          : undefined,
    },
  };
}

/**
 * Enumerate all valid post slugs for getStaticPaths in the catch-all.
 */
export async function getPaths(
  locales: string[],
  defaultLocale: string,
  opts: { showDrafts?: boolean } = {},
) {
  const allPosts = await getCollection('posts');
  const published = getPublishedPosts(allPosts, opts.showDrafts);

  const seen = new Set<string>();
  const paths: Array<{ params: { slug: string }; props: { fromResolver: true } }> = [];

  for (const post of published) {
    const { postKey } = extractPostLocale(post.id);
    const slug = post.data.urlSlug ?? postKey;
    if (!seen.has(slug)) {
      seen.add(slug);
      paths.push({ params: { slug }, props: { fromResolver: true } });
    }
  }

  return paths;
}
