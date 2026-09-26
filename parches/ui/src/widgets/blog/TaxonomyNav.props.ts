import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  kind: z.enum(['tags', 'categories']).optional().meta({ help: "tags: #chips for a personal blog · categories: the sections a company or magazine is organised in. Default: the current page's kind, else tags." }),
  label: z.string().optional().meta({ help: 'The word before the chips. Default: "Tags" or "Categories".' }),
  limit: z.number().int().min(1).max(20).default(8).meta({ help: 'The most used terms first; the rest are on their own pages.' }),
  all: z.boolean().default(true).meta({ help: 'An "All" chip back to the whole list.' }),
  rss: z.boolean().default(true).meta({ help: 'The feed link at the end of the row.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Blog topics',
    description: 'A row of tags or categories with their pages, the current one marked, and the feed.',
    category: 'blog',
    icon: 'tabler:tags',
  },
};
