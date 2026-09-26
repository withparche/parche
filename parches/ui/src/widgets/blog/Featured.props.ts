import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  layout: z.enum(['one', 'lead']).default('one').meta({ help: 'one: a single large card · lead: one lead story and three beside it, for a magazine front.' }),
  label: z.string().optional().meta({ help: 'The eyebrow: "Featured", "Latest issue". Default: "Featured".' }),
  /** Posts to feature instead of the blog's featured ones. */
  posts: z.array(z.any()).optional(),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Featured posts',
    description: 'The post marked featured (or the newest) as a large card, or a lead story with three beside it.',
    category: 'blog',
    icon: 'tabler:star',
  },
};
