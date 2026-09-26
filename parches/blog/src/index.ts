import { fileURLToPath } from 'node:url';
// Imported with the config: a dynamic import in the build-done hook would go
// through Vite's module runner, which is closed by then. Importing it starts
// nothing; the Pagefind binary runs only while the index is built.
import * as pagefind from 'pagefind';
import path from 'node:path';
import type { ParcheManifest } from '@parche/astro';
import type { BlogConfig } from './types.js';
import { resolveBlogConfig, permalinkToRoutePattern } from './types.js';
import { validateBlogConfig } from './config-schema.js';

export type { BlogConfig, BlogPreset, ResolvedBlogConfig } from './types.js';
export { resolvePostPermalink, resolveTaxonomyPermalink, resolveAuthorHref, localizePath, BLOG_PRESETS } from './types.js';
export { DEFAULT_LABELS, resolveLabels, format } from './labels.js';
export type { BlogLabels, BlogLabelsConfig } from './labels.js';

/**
 * Check if a post permalink pattern produces a route that could conflict
 * with the catch-all [...slug]. This happens when the route has no static
 * prefix segment (e.g. '/%slug%' → '[slug]', '/%year%/%slug%' → '[year]/[slug]').
 */
function isRootLevelPermalink(permalink: string): boolean {
  const routePattern = permalinkToRoutePattern(permalink);
  // If every segment is dynamic (wrapped in []), it conflicts with [...slug]
  return routePattern.split('/').every((seg) => seg.startsWith('['));
}

/**
 * Builds the search index over the built site with Pagefind, into
 * `<out>/pagefind/`. Only what an article marks with `data-pagefind-body` is
 * indexed, so the search finds posts, not every page that mentions a word.
 */
async function buildSearchIndex({ dir, logger }: { dir: URL; logger: { info(m: string): void; warn(m: string): void } }) {
  try {
    const { index, errors } = await pagefind.createIndex({});
    if (!index) throw new Error(errors.join('; '));
    const { page_count } = await index.addDirectory({ path: fileURLToPath(dir) });
    const written = await index.writeFiles({ outputPath: fileURLToPath(new URL('pagefind/', dir)) });
    if (written.errors.length) throw new Error(written.errors.join('; '));
    if (page_count === 0) logger.warn('search: no prerendered posts to index; the search page will find nothing.');
    else logger.info(`search: index written from ${page_count} built page(s); only articles are searchable`);
  } finally {
    await pagefind.close();
  }
}

/**
 * Create a blog app for Parche.
 *
 * Usage in astro.config:
 *   import createBlog from '@parche/astro-blog';
 *   parche({ apps: [createBlog({ postsPerPage: 12 })] })
 *
 *   // Custom permalinks:
 *   parche({ apps: [createBlog({
 *     permalinks: {
 *       post: '/%year%/%month%/%slug%',
 *       tag: '/tag/%tag%',
 *       category: '/category/%category%',
 *     }
 *   })] })
 */
export default function createBlog(config?: BlogConfig): ParcheManifest {
  validateBlogConfig(config);
  const resolved = resolveBlogConfig(config);
  const srcDir = path.dirname(fileURLToPath(import.meta.url));
  const routePath = (...segments: string[]) => path.resolve(srcDir, 'routes', ...segments);
  const templatePath = (...segments: string[]) => path.resolve(srcDir, 'templates', ...segments);
  const resolverPath = path.resolve(srcDir, 'resolver.ts');

  const { permalinks } = resolved;
  const useResolver = isRootLevelPermalink(permalinks.post);

  const routes: ParcheManifest['routes'] = [
    // Blog listing (paginated)
    { pattern: `${permalinkToRoutePattern(permalinks.listing)}/[...page]`, entrypoint: routePath('blog', '[...page].astro') },
    // Tag listing (paginated)
    { pattern: `${permalinkToRoutePattern(permalinks.tag)}/[...page]`, entrypoint: routePath('tag', '[tag]', '[...page].astro') },
    // Category listing (paginated)
    { pattern: `${permalinkToRoutePattern(permalinks.category)}/[...page]`, entrypoint: routePath('category', '[category]', '[...page].astro') },
  ];

  // Author pages only when there are several writers; one writer is the About page.
  if (resolved.authors === 'many') {
    routes.push({ pattern: `${permalinkToRoutePattern(permalinks.author)}/[...page]`, entrypoint: routePath('author', '[author]', '[...page].astro') });
  }

  // Single post: use own route if prefixed, otherwise use resolver via catch-all
  if (!useResolver) {
    routes.push({
      pattern: permalinkToRoutePattern(permalinks.post),
      entrypoint: routePath('blog', '[slug].astro'),
    });
  }

  // Series route (only if enabled)
  if (resolved.series) {
    routes.push({
      pattern: permalinkToRoutePattern(permalinks.series),
      entrypoint: routePath('series', '[series].astro'),
    });
  }

  // Archive: the latest year by month, and a page per earlier year
  if (resolved.archive) {
    routes.push({ pattern: `${permalinkToRoutePattern(permalinks.archive)}/[...year]`, entrypoint: routePath('archive', '[...year].astro') });
  }

  // The subscription page
  if (resolved.subscribe) {
    routes.push({ pattern: resolved.subscribe.path.replace(/^\//, ''), entrypoint: routePath('subscribe.astro') });
  }

  // The search page (the index is built after the site, below)
  if (resolved.search) {
    routes.push({ pattern: resolved.search.path.replace(/^\//, ''), entrypoint: routePath('search.astro') });
  }

  // ads.txt, which AdSense needs, from the publisher id
  if (resolved.ads && resolved.ads.provider === 'adsense' && resolved.ads.client) {
    routes.push({ pattern: 'ads.txt', entrypoint: routePath('ads.txt.ts') });
  }

  // RSS feed
  if (resolved.rss) {
    routes.push({
      pattern: permalinks.rss.replace(/^\//, ''),
      entrypoint: routePath('rss.xml.ts'),
    });
  }

  return {
    name: 'blog',
    // Let Tailwind scan the blog's route/template components, even from npm.
    content: [path.resolve(srcDir, '**/*.astro')],
    templates: {
      'blog-post': templatePath('blog-post.astro'),
    },
    routes,
    // Feed readers and browsers find the feed from any page's head.
    ...(resolved.rss ? { head: { links: [{ rel: 'alternate', type: 'application/rss+xml', href: permalinks.rss }] } } : {}),
    config: resolved as unknown as Record<string, unknown>,
    ...(resolved.search ? { hooks: { 'astro:build:done': buildSearchIndex }, siteSearch: `${resolved.search.path}?q={search_term_string}` } : {}),
    requires: {
      elements: ['Container', 'Section'],
      widgets: [
        // The widgets of the preset views.
        'Section',
        'blog/PageHeader',
        'blog/Featured',
        'blog/TaxonomyNav',
        'blog/PostList',
        'blog/Pagination',
        'blog/ArticleHeader',
        'blog/ArticleBody',
        'blog/SeriesBox',
        'blog/AuthorBox',
        'blog/ReadNext',
        'blog/TOC',
        'blog/SeriesParts',
        'blog/AuthorProfile',
        'blog/Writers',
        'blog/Archive',
        'blog/Subscribe',
        'blog/IssuePreview',
        'blog/Search',
        'AdSlot',
        'blog/Picks',
        'blog/Comments',
        'Columns',
        'Column',
      ],
    },
    ...(useResolver ? { resolver: { entrypoint: resolverPath } } : {}),
  };
}
