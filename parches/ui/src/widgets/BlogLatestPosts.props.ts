import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { heading, headingGroup } from '../_shared/content';

const { tagline, title, subtitle, align } = heading();

export const schema = z.object({
  tagline,
  title: title.default('Latest Posts'),
  subtitle,
  link: z
    .union([z.literal(false), z.object({ text: z.string().default('View all posts'), href: z.string().optional().meta({ help: 'Defaults to the blog listing in the page locale.' }) })])
    .default({ text: 'View all posts' })
    .meta({ help: 'The link to the listing beside the heading; false hides it.' }),
  align,
  count: z.number().default(4).meta({ help: 'Number of posts to show' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Blog Latest Posts',
    description: 'Grid of latest blog posts',
    category: 'blog',
    icon: 'tabler:article',
  },
  ui: { groups: [headingGroup, { key: 'content', label: 'Posts', fields: ['count'] }] },
};
