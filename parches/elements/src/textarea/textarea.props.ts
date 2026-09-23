import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  name: z.string(),
  label: z.string(),
  value: z.string().optional(),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  error: z.string().optional(),
  rows: z.number().int().min(1).default(4),
  grow: z.boolean().default(true).meta({ help: 'Grow with the content (`field-sizing: content`); `rows` is then the minimum.' }),
  required: z.boolean().default(false),
  disabled: z.boolean().default(false),
  readonly: z.boolean().default(false),
  hideLabel: z.boolean().default(false),
  maxlength: z.number().int().optional(),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Textarea',
    description: 'A multi-line text field with its label, help text and error.',
    tokens: ['color-surface', 'color-border', 'color-heading', 'color-muted', 'color-ring', 'color-danger', 'color-surface-hover'],
    parts: [
      { name: 'textarea', element: 'textarea' },
    ],
  },
});
