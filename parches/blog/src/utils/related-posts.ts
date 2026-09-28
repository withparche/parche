/**
 * The posts shown as related to one post: the ones it declares in its
 * frontmatter (`related`, by key: the file name that pairs a post with its
 * translations), in that order, each taken in the page's locale; and when
 * it declares none, the latest posts of its category, then the latest of
 * the blog, so a small blog without categories still offers something to
 * read next. Declared is the editorial choice, never topped up; the
 * fallback is one fixed rule, so what a reader sees follows from the
 * content and nothing is scored behind their back.
 */
import type { Post, PostIndex } from './post-index.js';

export function relatedPosts(current: Post, index: PostIndex, locale: string, count = 3): Post[] {
  if (count <= 0) return [];
  const declared = (current.data as { related?: string[] }).related ?? [];
  if (declared.length) {
    const out: Post[] = [];
    for (const key of declared) {
      const post = index.translations(key).find((t) => t.locale === locale)?.post;
      if (post && post.id !== current.id && !out.includes(post)) out.push(post);
      if (out.length === count) break;
    }
    return out;
  }
  const others = index.published(locale).filter((p) => p.id !== current.id);
  const category = current.data.category;
  const same = category ? others.filter((p) => p.data.category === category) : [];
  return [...same, ...others.filter((p) => !same.includes(p))].slice(0, count);
}
