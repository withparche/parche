import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  name: z.string().optional(),
  label: z.string().meta({ help: 'Visible label; also the accessible name.' }),
  min: z.number().default(0),
  max: z.number().default(100),
  step: z.number().default(1),
  value: z.number().optional(),
  disabled: z.boolean().default(false),
  showValue: z.boolean().default(true).meta({ help: 'Show the current value next to the label.' }),
  unit: z.string().optional().meta({ help: 'Suffix for the shown value, e.g. "%".' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Slider',
    description: 'A single value in a range: a native range input.',
    a11y: { pattern: 'slider', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/slider/' },
    tokens: ['color-primary', 'color-heading', 'color-muted', 'color-ring'],
    parts: [
      { name: 'root', element: 'div' },
      { name: 'label', element: 'label' },
      { name: 'value', element: 'output', description: 'The live value; aria-hidden, the slider itself announces it.' },
      { name: 'input', element: 'input' },
    ],
  },
});
