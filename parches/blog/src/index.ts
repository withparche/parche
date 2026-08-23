import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { ParcheManifest } from '@parche/core';
import type { BlogConfig } from './types.js';
import { resolveBlogConfig, permalinkToRoutePattern } from './types.js';

export type { BlogConfig } from './types.js';
export { resolvePostPermalink, resolveTaxonomyPermalink, localizePath } from './types.js';
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
 * Create a blog app for Parche.
 *
 * Usage in astro.config:
 *   import createBlog from '@parche/blog';
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
    // Author listing (paginated)
    { pattern: `${permalinkToRoutePattern(permalinks.author)}/[...page]`, entrypoint: routePath('author', '[author]', '[...page].astro') },
  ];

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
    config: resolved as unknown as Record<string, unknown>,
    requires: {
      primitives: ['Container', 'Section'],
      widgets: [
        'blog/AuthorCard',
        'blog/BlogList',
        'blog/BlogPostHeader',
        'blog/Breadcrumbs',
        'blog/RelatedPosts',
        'blog/SeriesNav',
        'blog/ShareButtons',
        'blog/ToBlogLink',
      ],
    },
    ...(useResolver ? { resolver: { entrypoint: resolverPath } } : {}),
  };
}
