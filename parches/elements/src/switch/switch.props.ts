import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  name: z.string().optional().meta({ help: 'Form field name.' }),
  value: z.string().default('on'),
  checked: z.boolean().default(false),
  disabled: z.boolean().default(false),
  label: z.string().optional().meta({ help: 'Visible label. Otherwise slot the label text.' }),
  description: z.string().optional().meta({ help: 'Help text under the label.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Switch',
    description: 'An on/off control: a native checkbox with the switch role.',
    a11y: { pattern: 'switch', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/switch/' },
    tokens: ['color-primary', 'color-on-primary', 'color-surface', 'color-border', 'color-ring', 'color-heading', 'color-muted'],
    parts: [
      { name: 'root', element: 'label' },
      { name: 'input', element: 'input', role: 'switch' },
      { name: 'track', element: 'span', states: ['checked'] },
      { name: 'thumb', element: 'span' },
      { name: 'label', element: 'span' },
      { name: 'description', element: 'span' },
    ],
  },
});
