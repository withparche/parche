import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Series parts',
    description: 'The parts of a series in order, with their date; the announced ones marked, so readers know it continues.',
    category: 'blog',
    icon: 'tabler:list-numbers',
  },
};
