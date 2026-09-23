import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const types = ['text', 'email', 'url', 'tel', 'password', 'number', 'search', 'date', 'time'] as const;

export const schema = z.object({
  name: z.string(),
  label: z.string().meta({ help: 'The accessible name. `hideLabel` keeps it for assistive tech only.' }),
  type: z.enum(types).default('text'),
  value: z.string().optional(),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  error: z.string().optional().meta({ help: 'A validation message; marks the input invalid.' }),
  required: z.boolean().default(false),
  disabled: z.boolean().default(false),
  readonly: z.boolean().default(false),
  hideLabel: z.boolean().default(false),
  autocomplete: z.string().optional(),
  icon: z.string().optional().meta({ input: 'icon', help: 'A leading, decorative icon.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Input',
    description: 'A single-line text field with its label, help text and error.',
    tokens: ['color-surface', 'color-border', 'color-heading', 'color-muted', 'color-ring', 'color-danger', 'color-surface-hover'],
    parts: [
      { name: 'wrapper', element: 'div', description: 'Holds the icon and the input.' },
      { name: 'icon', element: 'span' },
      { name: 'input', element: 'input' },
    ],
  },
});
