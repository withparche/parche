import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  as: z.enum(['div', 'aside', 'section']).default('div').meta({ help: 'aside when the column is secondary content, like a sidebar.' }),
  sticky: z.boolean().default(false).meta({ help: 'Stay in view while the other columns scroll.' }),
  label: z.string().optional().meta({ help: 'Accessible name, for an aside.' }),
  gap: z.enum(['sm', 'md']).default('md').meta({ help: 'Space between the widgets in the column: sm for a text column (docs), md between blocks.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Column',
    description: 'One column of a Columns widget, holding any widgets.',
    category: 'layout',
    icon: 'tabler:layout-sidebar',
    // Only meaningful inside Columns; not offered on its own.
    hidden: true,
  },
  slots: {
    default: { label: 'Content', help: 'What the column holds.' },
  },
};
