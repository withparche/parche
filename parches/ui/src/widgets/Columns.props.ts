import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const ratios = ['equal', 'wide-start', 'wide-end', 'sides'] as const;

export const schema = z.object({
  ratio: z.enum(ratios).default('equal').meta({ help: 'Two columns: equal, or the first / the last one twice as wide. Three columns: equal, or sides: narrow rails either side of a wide middle (a docs shell). Four are always equal.' }),
  gap: z.enum(['sm', 'md', 'lg']).default('md'),
  align: z.enum(['start', 'center', 'stretch']).default('start').meta({ help: 'Vertical alignment of the columns.' }),
  stack: z.enum(['sm', 'md', 'lg']).default('md').meta({ help: 'Below this breakpoint the columns stack.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Columns',
    description: 'Side-by-side columns, each holding any widgets. Stacks on small screens.',
    category: 'layout',
    icon: 'tabler:columns',
  },
  slots: {
    default: { label: 'Columns', help: 'Two to four Column widgets.', allow: ['Column'], min: 2, max: 4 },
  },
};
