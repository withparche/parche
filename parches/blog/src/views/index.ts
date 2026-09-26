/**
 * The views each preset ships: one JSON tree per blog page type. A site
 * overrides one with `src/content/views/<name>.json` (see utils/views.ts).
 * Imported one by one, not globbed, so they load the same from npm.
 */
import personal_index from './personal/index.json';
import personal_taxonomy from './personal/taxonomy.json';
import personal_author from './personal/author.json';
import personal_post from './personal/post.json';
import personal_series from './personal/series.json';
import personal_archive from './personal/archive.json';
import personal_subscribe from './personal/subscribe.json';
import company_index from './company/index.json';
import company_taxonomy from './company/taxonomy.json';
import company_author from './company/author.json';
import company_post from './company/post.json';
import company_series from './company/series.json';
import company_archive from './company/archive.json';
import company_subscribe from './company/subscribe.json';
import magazine_index from './magazine/index.json';
import magazine_taxonomy from './magazine/taxonomy.json';
import magazine_author from './magazine/author.json';
import magazine_post from './magazine/post.json';
import magazine_series from './magazine/series.json';
import magazine_archive from './magazine/archive.json';
import magazine_subscribe from './magazine/subscribe.json';
import newsletter_index from './newsletter/index.json';
import newsletter_taxonomy from './newsletter/taxonomy.json';
import newsletter_author from './newsletter/author.json';
import newsletter_post from './newsletter/post.json';
import newsletter_series from './newsletter/series.json';
import newsletter_archive from './newsletter/archive.json';
import newsletter_subscribe from './newsletter/subscribe.json';

export const presetViews: Record<string, Record<string, { sections: unknown[]; wrapper?: unknown }>> = {
  personal: { index: personal_index, taxonomy: personal_taxonomy, author: personal_author, post: personal_post, series: personal_series, archive: personal_archive, subscribe: personal_subscribe },
  company: { index: company_index, taxonomy: company_taxonomy, author: company_author, post: company_post, series: company_series, archive: company_archive, subscribe: company_subscribe },
  magazine: { index: magazine_index, taxonomy: magazine_taxonomy, author: magazine_author, post: magazine_post, series: magazine_series, archive: magazine_archive, subscribe: magazine_subscribe },
  newsletter: { index: newsletter_index, taxonomy: newsletter_taxonomy, author: newsletter_author, post: newsletter_post, series: newsletter_series, archive: newsletter_archive, subscribe: newsletter_subscribe },
};
