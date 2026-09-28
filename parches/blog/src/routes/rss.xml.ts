import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { postIndex } from '../utils/posts.js';
import { resolvePostPermalink } from '../types.js';
import { resolveLabels } from '../labels.js';

export async function GET(context: APIContext) {
  const siteUrl = context.site?.href ?? '';
  const base = siteUrl.replace(/\/$/, '');

  const configModule = await import('parche:config');
  const blogConfigModule = await import('parche:app/blog');
  const i18nModule = await import('parche:config/i18n');
  const locale = context.currentLocale ?? i18nModule.defaultLocale;
  const published = (await postIndex(false)).published(locale);
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
    // The rendered HTML, which the content layer keeps for Markdown posts; the
    // raw body would show readers its asterisks and hashes. An MDX post has no
    // stored HTML, so its item carries the description only.
    ...((post as any).rendered?.html ? { content: (post as any).rendered.html } : {}),
  }));

  return rss({
    title: `${config.brand?.name ?? labels.blog} — ${labels.rssFeed}`,
    description: config.brand?.description ?? '',
    site: siteUrl,
    items,
    customData: `<language>${locale}</language>`,
  });
}
