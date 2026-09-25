import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { heading, headingGroup } from '../_shared/content';

const { tagline, title, subtitle, align } = heading();

export const schema = z.object({
  tagline,
  title,
  subtitle,
  link: z
    .union([z.literal(false), z.object({ text: z.string().default('View all posts'), href: z.string().optional().meta({ help: 'Defaults to the blog listing in the page locale.' }) })])
    .default({ text: 'View all posts' })
    .meta({ help: 'The link to the listing beside the heading; false hides it.' }),
  align,
  postIds: z.array(z.string()).default([]).meta({ help: 'Blog post IDs to highlight' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Blog Highlighted',
    description: 'Showcase specific blog posts by ID',
    category: 'blog',
    icon: 'tabler:bookmark',
  },
  ui: { groups: [headingGroup, { key: 'content', label: 'Posts', fields: ['postIds'] }] },
};
