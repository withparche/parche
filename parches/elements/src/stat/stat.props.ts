import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  value: z.string().meta({ help: 'The figure as text, e.g. "$1,200+", "99.9%", "5K". Counts up from zero when it scrolls into view.' }),
  label: z.string(),
  description: z.string().optional(),
  icon: z.string().optional().meta({ input: 'icon' }),
  align: z.enum(['start', 'center']).default('center'),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Stat',
    description: 'A figure with its label, counting up when it comes into view.',
    tokens: ['color-primary', 'color-heading', 'color-muted'],
    tag: { name: 'parche-stat', entry: './stat.element.ts' },
    keyboard: {
      'None': 'Static content.',
    },
    noJs: 'The final figure is rendered; the count-up is the only thing the element adds, and it is skipped under reduced motion.',
    parts: [
      { name: 'root', element: 'parche-stat' },
      { name: 'icon', element: 'span' },
      { name: 'value', element: 'p' },
      { name: 'label', element: 'p' },
      { name: 'description', element: 'p' },
    ],
  },
});
