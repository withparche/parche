import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  title: z.string().optional().meta({ help: 'Default: "Other writers".' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Other writers',
    description: "The blog's other writers, each linking to their page.",
    category: 'blog',
    icon: 'tabler:users',
  },
};
