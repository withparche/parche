/**
 * The site's posts, read and indexed once per build or server (see
 * utils/post-index.ts for what the index answers). With drafts and without
 * are two indexes: a development server shows drafts, a build never does.
 */
import { entriesOf, memo } from 'parche:utils/entries';
import { defaultLocale } from 'parche:config/i18n';
import { buildPostIndex, type Post, type PostIndex } from './post-index.js';

export type { Post, PostIndex };

export async function postIndex(showDrafts = false): Promise<PostIndex> {
  const posts = (await entriesOf('posts')) as unknown as Post[];
  return memo(`blog:posts:${showDrafts ? 'drafts' : 'published'}`, () => buildPostIndex(posts, defaultLocale, showDrafts));
}
