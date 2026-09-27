/**
 * What a development tool (the builder) needs to edit the blog's content,
 * reached through core's `parche:registry/dev` under `astro dev` only: the
 * schemas of the blog's collections, the resolved config, the views each
 * preset ships and the rules they are checked by, and where each post and
 * view is shown. An unstable, tooling-only contract; sites never import it.
 */
import config from 'parche:app/blog';
import { postSchema, authorSchema, taxonomySchema, seriesSchema, viewSchema } from './content/schemas.js';
import { presetViews } from './views/index.js';
import { checkPlacements } from './utils/placements.js';
import type { ResolvedBlogConfig } from './types.js';

export { postPath, viewPaths } from './utils/view-paths.js';
export { presetViews, checkPlacements };

export const blogConfig = config as unknown as ResolvedBlogConfig;

/** Each blog collection's schema, as the content layer checks it. */
export const schemas = { posts: postSchema, authors: authorSchema, taxonomies: taxonomySchema, series: seriesSchema, views: viewSchema };

/** The views this blog renders: its preset's. A site's own lives at `views/blog-<name>` (or `views/<locale>/blog-<name>`). */
export const viewNames = Object.keys(presetViews[blogConfig.preset] ?? {});
