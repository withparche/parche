import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  title: z.string().optional().meta({ help: 'Default: "Read next".' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Read next',
    description: 'The posts related to this one, after it: exactly the next thing to read.',
    category: 'blog',
    icon: 'tabler:arrow-right',
  },
};
