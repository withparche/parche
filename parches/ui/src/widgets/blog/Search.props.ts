import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  topics: z.number().int().min(0).max(12).default(6).meta({ help: 'How many topics to suggest when nothing matches: the most used categories and tags.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Blog search',
    description: "Search over the blog's posts. When nothing matches: topics to try, the archive, the subscription.",
    category: 'blog',
    icon: 'tabler:search',
  },
};
