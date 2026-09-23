import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const option = z.object({
  value: z.string(),
  label: z.string(),
  disabled: z.boolean().default(false),
});

export const group = z.object({
  label: z.string(),
  options: z.array(option).min(1),
});

export const schema = z.object({
  name: z.string(),
  label: z.string(),
  options: z.array(z.union([option, group])).min(1).meta({ help: 'Options, or groups of options with a label.' }),
  value: z.string().optional(),
  placeholder: z.string().optional().meta({ help: 'A first, unselectable option shown until a choice is made.' }),
  description: z.string().optional(),
  error: z.string().optional(),
  required: z.boolean().default(false),
  disabled: z.boolean().default(false),
  hideLabel: z.boolean().default(false),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Select',
    description: 'One choice from a list: the native select, styled.',
    tokens: ['color-surface', 'color-border', 'color-heading', 'color-muted', 'color-ring', 'color-danger'],
    parts: [
      { name: 'wrapper', element: 'div' },
      { name: 'select', element: 'select' },
      { name: 'indicator', element: 'span', description: 'The chevron.' },
    ],
  },
});
