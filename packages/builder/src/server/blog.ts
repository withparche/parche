// @ts-expect-error virtual module provided by @parche/astro
import devTools from 'parche:registry/dev';
import type { ZodType } from 'zod';

/**
 * The blog's module for development tools, when the site has the blog
 * parche (`parche:registry/dev`): its collections' schemas, its resolved
 * config, its views and where posts and views are shown. Null otherwise;
 * the builder then offers no blog documents.
 */
export interface BlogTools {
  blogConfig: {
    preset: string;
    permalinks: Record<string, string>;
    authors: 'one' | 'many';
    series: boolean;
    toc: boolean;
    archive: boolean;
    subscribe: false | { path: string };
    search: false | { path: string };
    [k: string]: unknown;
  };
  schemas: Record<'posts' | 'authors' | 'taxonomies' | 'series' | 'views', ZodType>;
  presetViews: Record<string, Record<string, { sections: unknown[]; wrapper?: unknown }>>;
  viewNames: string[];
  checkPlacements: (view: { sections: unknown[] }) => string[];
  postPath: (config: unknown, post: { id: string; data: Record<string, unknown> }, locales: string[], defaultLocale: string) => string;
  viewPaths: (config: unknown, posts: { id: string; data: Record<string, unknown> }[], views: string[], defaultLocale: string) => Record<string, string | null>;
}

export async function loadBlog(): Promise<BlogTools | null> {
  const load = (devTools as Record<string, (() => Promise<unknown>) | undefined>).blog;
  if (!load) return null;
  return (await load()) as BlogTools;
}
