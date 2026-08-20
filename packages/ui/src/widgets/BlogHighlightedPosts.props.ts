import { z } from 'zod';
import type { WidgetMeta } from '@parche/core/types';

export const schema = z.object({
  title: z.string().optional(),
  linkText: z.string().optional().meta({ placeholder: 'View all posts' }),
  linkUrl: z.string().optional().meta({ placeholder: '/blog' }),
  information: z.string().optional().meta({ input: 'textarea' }),
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
};
