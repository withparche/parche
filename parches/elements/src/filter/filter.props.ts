import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  options: z
    .array(z.object({ value: z.string(), label: z.string(), count: z.number().int().optional().meta({ help: 'Shown after the label; counted from the items when omitted.' }) }))
    .min(1)
    .meta({ help: 'What the reader can filter by. The first, with value "", shows everything.' }),
  label: z.string().default('Filter').meta({ help: 'The small caps label before the options, and the group\'s name.' }),
  aside: z.string().optional().meta({ help: 'A quiet note at the end of the bar: "Everything, newest first".' }),
  status: z.string().default('Showing {n} of {total}').meta({ help: 'Announced after filtering; {n} and {total} are replaced.' }),
  empty: z.string().default('Nothing matches this filter.').meta({ help: 'Shown when no item matches.' }),
  clear: z.string().default('Show everything'),
  sticky: z.boolean().default(false).meta({ help: 'Keep the bar in view under the site header while the list scrolls.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Filter',
    description: 'A row of toggles that shows only the items of a list carrying the chosen value, with the count and an empty state.',
    tokens: ['color-border', 'color-surface', 'color-heading', 'color-muted', 'color-foreground', 'color-background'],
    tag: { name: 'parche-filter', entry: './filter.element.ts' },
    keyboard: {
      'Tab': 'Moves between the options.',
      'Enter / Space': 'Applies an option; pressing the active one again keeps it.',
    },
    noJs: 'The bar is hidden and every item shows; nothing is lost without script.',
    parts: [
      { name: 'root', element: 'parche-filter' },
      { name: 'bar', element: 'div', description: 'The label, the options and the aside.' },
      { name: 'option', element: 'button', states: ['on', 'off'] },
      { name: 'count', element: 'span', description: 'The number after an option\'s label.' },
      { name: 'items', element: 'div', description: 'The default slot: items carry data-filter="value value".' },
      { name: 'empty', element: 'div' },
      { name: 'clear', element: 'button', description: 'In the empty state: back to everything.' },
      { name: 'status', element: 'p' },
    ],
  },
});
