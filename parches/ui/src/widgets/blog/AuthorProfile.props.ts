import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  author: z.string().optional().meta({ help: 'The author key (its file name in the authors collection), for an About page. On an author page, the page\'s author.' }),
  heading: z.enum(['h1', 'h2']).default('h1').meta({ help: 'h1 on an author or About page; h2 when it sits under another heading.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Author profile',
    description: 'A writer: portrait, name, role, bio, links and how many posts. On an author page, or an About page for a one-writer blog.',
    category: 'blog',
    icon: 'tabler:user-circle',
  },
};
