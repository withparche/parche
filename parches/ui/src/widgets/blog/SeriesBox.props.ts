import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  variant: z.enum(['top', 'next']).default('top').meta({ help: 'top: "Part 2 of 4" and the part before, to open the post · next: the next part, or its date when it is only announced, to close it.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Series box',
    description: 'Where a post sits in its series: the part and the one before at the top; the next part, or its date, at the end.',
    category: 'blog',
    icon: 'tabler:list-numbers',
  },
};
