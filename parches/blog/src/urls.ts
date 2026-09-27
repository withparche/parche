/**
 * Where the blog's posts are served, for core (`urls` in the manifest): an
 * entry of `posts` that a `{ "$collection": "posts" }` or a `$ref` yields
 * carries this address as `href`, so a list anywhere on the site links to
 * the post without knowing the blog's permalink.
 */
import config from 'parche:app/blog';
import { defaultLocale } from 'parche:config/i18n';
import { resolvePostPermalink } from './types.js';
import { extractPostLocale } from './utils/post-helpers.js';

export default function postUrl(post: { id: string; data: Record<string, unknown> }): string {
  const { locale } = extractPostLocale(post.id, defaultLocale);
  return resolvePostPermalink((config as any).permalinks.post, post as never, locale, defaultLocale);
}
