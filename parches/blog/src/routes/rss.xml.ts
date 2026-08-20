import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { getPublishedPosts } from '../utils/post-helpers.js';
import { resolvePostPermalink } from '../types.js';

export async function GET(context: APIContext) {
  const allPosts = await getCollection('posts');
  const siteUrl = context.site?.href ?? '';
  const base = siteUrl.replace(/\/$/, '');

  const configModule = await import('parche:config');
  const blogConfigModule = await import('parche:app/blog');
  const i18nModule = await import('parche:config/i18n');
  const locale = context.currentLocale ?? i18nModule.defaultLocale;
  const published = getPublishedPosts(allPosts, false, locale);
  const config = configModule.default;
  const blogConfig = blogConfigModule.default;

  const permalinks = blogConfig.permalinks;

  const items = published.map((post: any) => ({
    title: post.data.title,
    description: post.data.excerpt ?? post.data.description,
    link: `${base}${resolvePostPermalink(permalinks.post, post)}`,
    pubDate: post.data.publishDate,
    categories: [
      ...(post.data.category ? [post.data.category] : []),
      ...post.data.tags,
    ].filter(Boolean),
    ...(post.data.authorName ? { author: post.data.authorName } : {}),
    ...(post.body ? { content: post.body } : {}),
  }));

  return rss({
    title: `${config.site?.name ?? 'Blog'} — RSS Feed`,
    description: config.site?.description ?? '',
    site: siteUrl,
    items,
  });
}
