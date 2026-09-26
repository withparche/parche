// @ts-expect-error virtual module provided by @parche/astro
import { defaultLocale } from 'parche:config/i18n';
import { session } from '../../server/session.js';
import { json } from '../../server/guard.js';
import { handle } from '../../server/http.js';
import { listDocs, readDoc } from '../../server/files.js';

/**
 * The site's pages as the links a `url` field can point to: title and URL,
 * computed the way the page route does (the locale prefix unless it is the
 * default, `home` at the root, `urlSlug` over the file's key).
 */
export const GET = handle(async () => {
  const root = session().root;
  const links = [];
  for (const d of await listDocs(root, 'pages')) {
    const [locale, ...rest] = d.id.split('/');
    const key = rest.join('/');
    const doc = await readDoc(root, 'pages', d.id).catch(() => null);
    const slug = (doc?.data.urlSlug as string | undefined) ?? key;
    const prefix = locale === defaultLocale ? '' : `/${locale}`;
    const url = key === 'home' ? prefix || '/' : `${prefix}/${slug}`;
    links.push({ id: d.id, locale, title: (doc?.data.title as string | undefined) ?? key, url });
  }
  return json({ links });
});
