import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Archive',
    description: "A year's posts by month, and the earlier years with their counts: for the reader who half remembers a post.",
    category: 'blog',
    icon: 'tabler:archive',
  },
};
