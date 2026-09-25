import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

const page = z.object({ title: z.string(), href: z.string() });

export const schema = z.object({
  previous: page.optional(),
  next: page.optional(),
  previousLabel: z.string().default('Previous'),
  nextLabel: z.string().default('Next'),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Previous and next',
    description: 'The pages before and after this one, for reading a guide in order.',
    category: 'navigation',
    icon: 'tabler:arrows-left-right',
  },
};
