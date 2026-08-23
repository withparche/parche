import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { getPublishedPosts } from '../utils/post-helpers.js';
import { resolvePostPermalink } from '../types.js';
import { resolveLabels } from '../labels.js';

export async function GET(context: APIContext) {
  const allPosts = await getCollection('posts');
  const siteUrl = context.site?.href ?? '';
  const base = siteUrl.replace(/\/$/, '');

  const configModule = await import('parche:config');
  const blogConfigModule = await import('parche:app/blog');
  const i18nModule = await import('parche:config/i18n');
  const locale = context.currentLocale ?? i18nModule.defaultLocale;
  const published = getPublishedPosts(allPosts, false, locale);
  const { localizeSiteConfig } = await import('parche:utils/site');
  const config = localizeSiteConfig(configModule.default, locale);
  const blogConfig = blogConfigModule.default;

  const permalinks = blogConfig.permalinks;
  const labels = resolveLabels((blogConfig as any).labels, locale, i18nModule.defaultLocale);

  const items = published.map((post: any) => ({
    title: post.data.title,
    description: post.data.excerpt ?? post.data.description,
    link: `${base}${resolvePostPermalink(permalinks.post, post, locale, i18nModule.defaultLocale)}`,
    pubDate: post.data.publishDate,
    categories: [
      ...(post.data.category ? [post.data.category] : []),
      ...post.data.tags,
    ].filter(Boolean),
    ...(post.data.authorName ? { author: post.data.authorName } : {}),
    ...(post.body ? { content: post.body } : {}),
  }));

  return rss({
    title: `${config.site?.name ?? labels.blog} — ${labels.rssFeed}`,
    description: config.site?.description ?? '',
    site: siteUrl,
    items,
    customData: `<language>${locale}</language>`,
  });
}
