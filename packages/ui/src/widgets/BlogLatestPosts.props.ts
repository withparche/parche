import { z } from 'zod';
import type { WidgetMeta } from '@parche/core/types';

export const schema = z.object({
  title: z.string().optional(),
  linkText: z.string().optional().meta({ placeholder: 'View all posts' }),
  linkUrl: z.string().optional().meta({ placeholder: '/blog' }),
  information: z.string().optional().meta({ input: 'textarea' }),
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
};
