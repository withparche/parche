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
import { getPublishedPosts, extractPostLocale, getPostAlternates } from './utils/post-helpers.js';
import { querySinglePost } from './utils/blog-query.js';
import { calculateReadingTime } from './utils/reading-time.js';
import { extractTOC } from './utils/toc.js';
import { generateBlogPostingJsonLd, generateBreadcrumbJsonLd } from './utils/blog-metadata.js';
import { resolvePostPermalink, resolveTaxonomyPermalink, localizePath } from './types.js';
import { createTaxonomyResolver } from './utils/taxonomy.js';

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
  /**
   * Generic trailing nodes the core route renders (via NodeRenderer) after
   * the post body — related posts, series nav, etc. The blog parche owns the
   * widget names and props; core renders them by name and knows none of them.
   */
  extras: {
    sections: Array<{ widget: string; props?: Record<string, any>; slots?: Record<string, any[]> }>;
  };
  /**
   * This post's translations, one per locale that actually has one. Core emits
   * them as hreflang and feeds the language switcher; it has no way to work them
   * out itself, because the pairing rule belongs to the app that owns the content.
   */
  alternates: Array<{ locale: string; path: string }>;
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
  const { defaultLocale } = await import('parche:config/i18n');
  const { resolveLabels } = await import('./labels.js');
  const labels = resolveLabels(cfg.labels, locale, defaultLocale);
  const tax = await createTaxonomyResolver(locale);

  const { post } = await querySinglePost({
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
      if (author) {
      // The author route generates its paths from the entry key (or an explicit
      // `urlSlug`), so links must use that — not a slugified display name.
      const key = author.id.includes('/') ? author.id.slice(author.id.indexOf('/') + 1) : author.id;
      authorData.push({ ...author.data, slug: (author.data as any).urlSlug ?? key });
    }
    } catch {
      /* author not found */
    }
  }
  if (authorData.length === 0 && post.data.authorName) {
    authorData.push({ name: post.data.authorName });
  }

  // JSON-LD
  const siteUrl = opts.siteUrl ?? '';
  const siteName = opts.siteName ?? '';
  const base = siteUrl.replace(/\/$/, '');
  const pageUrl = `${base}${resolvePostPermalink(permalinks.post, post, locale, defaultLocale)}`;

  // Resolve '@/assets/…' before anything derives a URL from it: JSON-LD prefixes
  // the site origin onto image.src, and after that the path is no longer
  // recognisable as an asset reference.
  const { resolveAssets } = await import('parche:utils/assets');
  const postData = await resolveAssets({ ...post.data, readingTime });

  const blogPostingJsonLd = generateBlogPostingJsonLd({
    post: postData,
    url: pageUrl,
    siteUrl,
    authorName: authorData[0]?.name,
  });
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: labels.home, url: `${base}${localizePath('/', locale, defaultLocale)}` || '/' },
    { name: labels.blog, url: `${base}${localizePath(permalinks.listing, locale, defaultLocale)}` },
    ...(post.data.category
      ? [{ name: post.data.category, url: `${base}${resolveTaxonomyPermalink(permalinks.category, tax.slugFor('categories', post.data.category), locale, defaultLocale)}` }]
      : []),
    { name: post.data.title, url: pageUrl },
  ]);


  // Trailing sections as generic { widget, props, wrapper } — the blog parche
  // decides the widgets and their layout; the core route just renders them.
  // Series and related posts are part of the post's view now (see the
  // template), so the resolver adds no sections of its own.
  const extraSections: ResolvedPost['extras']['sections'] = [];

  // Translations of this post: same file name under a different locale directory.
  const { postKey: currentKey } = extractPostLocale(post.id, defaultLocale);
  const alternates = getPostAlternates(await getCollection('posts'), currentKey, defaultLocale, opts.showDrafts)
    .map(({ locale: altLocale, post: altPost }) => ({
      locale: altLocale,
      path: resolvePostPermalink(permalinks.post, altPost, altLocale, defaultLocale),
    }));

  return {
    alternates,
    template: post.data.template || 'blog-post',
    layout: post.data.layout || 'default',
    collection: 'posts',
    entryId: post.id,
    templateProps: {
      ...(await resolveAssets({ data: postData, authorData, permalinks })),
      // The entry itself: the template builds the article from it (series,
      // related posts, authors), the same way on both post paths.
      entry: post,
    },
    metadata: await resolveAssets({
      title: `${post.data.metadata?.title ?? post.data.title} — ${siteName}`,
      description: post.data.metadata?.description ?? post.data.description ?? post.data.excerpt,
      canonical: post.data.metadata?.canonical,
      noindex: post.data.metadata?.noindex ?? post.data.draft ?? false,
      nofollow: post.data.metadata?.nofollow ?? false,
      ogType: 'article' as const,
      ogTitle: post.data.metadata?.ogTitle ?? post.data.title,
      ogDescription: post.data.metadata?.ogDescription ?? post.data.description,
      ogImage: post.data.metadata?.ogImage ?? postData.image?.src,
      twitterCard: post.data.metadata?.twitterCard ?? ('summary_large_image' as const),
      article: {
        author: authorData[0]?.name,
        publishedDate: post.data.publishDate.toISOString(),
        modifiedDate: post.data.modifiedDate?.toISOString(),
        section: post.data.category,
        tags: post.data.tags,
      },
      jsonLd: [blogPostingJsonLd, breadcrumbJsonLd],
    }),
    extras: { sections: extraSections },
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
  const blogConfigModule = await import('parche:app/blog');
  const permalinks = (blogConfigModule.default as any).permalinks;

  const allPosts = await getCollection('posts');
  const published = getPublishedPosts(allPosts, opts.showDrafts);

  const seen = new Set<string>();
  const paths: Array<{
    params: { slug: string };
    props: { fromResolver: true; resolverSlug: string; resolverLocale: string };
  }> = [];

  for (const post of published) {
    const { locale, postKey } = extractPostLocale(post.id, defaultLocale);
    // A post whose first id segment isn't a configured locale has no locale dir;
    // treat it as the default locale rather than inventing a bogus prefix.
    const postLocale = locales.includes(locale) ? locale : defaultLocale;

    // Reuse the permalink resolver so the generated paths and the links rendered
    // elsewhere can never disagree. Params are path-relative, so drop the slash.
    const slug = resolvePostPermalink(permalinks.post, post, postLocale, defaultLocale).replace(/^\//, '');

    // Dedupe on the localized path: two locales sharing a post key no longer
    // collide, because only one of them is unprefixed.
    if (!seen.has(slug)) {
      seen.add(slug);
      // Carry the lookup key and locale explicitly: the URL may contain date
      // segments (e.g. /2026/03/my-post) that the post lookup must not see.
      paths.push({
        params: { slug },
        props: { fromResolver: true, resolverSlug: post.data.urlSlug ?? postKey, resolverLocale: postLocale },
      });
    }
  }

  return paths;
}
