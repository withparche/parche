import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  name: z.string(),
  label: z.string().meta({ help: 'The label. Inline HTML allowed (a link to the terms).' }),
  value: z.string().default('on'),
  checked: z.boolean().default(false),
  description: z.string().optional(),
  error: z.string().optional(),
  required: z.boolean().default(false),
  disabled: z.boolean().default(false),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Checkbox',
    description: 'A yes/no choice with its label: the native checkbox.',
    tokens: ['color-primary', 'color-border', 'color-heading', 'color-muted', 'color-ring', 'color-danger'],
    parts: [
      { name: 'root', element: 'div', states: ['valid', 'invalid'] },
      { name: 'input', element: 'input' },
      { name: 'label', element: 'label' },
      { name: 'description', element: 'p' },
      { name: 'error', element: 'p' },
    ],
  },
});
