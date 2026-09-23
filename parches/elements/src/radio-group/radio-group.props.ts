import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const option = z.object({
  value: z.string(),
  label: z.string(),
  description: z.string().optional(),
  disabled: z.boolean().default(false),
});

export const schema = z.object({
  name: z.string(),
  label: z.string().meta({ help: 'The group\'s name (the legend).' }),
  options: z.array(option).min(2),
  value: z.string().optional(),
  description: z.string().optional(),
  error: z.string().optional(),
  required: z.boolean().default(false),
  disabled: z.boolean().default(false),
  orientation: z.enum(['vertical', 'horizontal']).default('vertical'),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'RadioGroup',
    description: 'One choice among a few, all visible: native radios in a fieldset.',
    a11y: { pattern: 'radio group', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/' },
    tokens: ['color-primary', 'color-border', 'color-heading', 'color-muted', 'color-ring', 'color-danger'],
    parts: [
      { name: 'root', element: 'fieldset', states: ['valid', 'invalid'] },
      { name: 'legend', element: 'legend' },
      { name: 'option', element: 'div' },
      { name: 'input', element: 'input' },
      { name: 'label', element: 'label' },
      { name: 'description', element: 'p' },
      { name: 'error', element: 'p' },
    ],
  },
});
