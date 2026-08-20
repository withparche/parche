import { z } from 'zod';
import type { WidgetMeta } from '@parche/core/types';

const inputField = z.object({
  type: z.string().default('text'),
  name: z.string(),
  label: z.string().optional(),
  autocomplete: z.string().optional(),
  placeholder: z.string().optional(),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  description: z.string().optional().meta({ input: 'textarea' }),
  inputs: z.array(inputField).default([]),
  textarea: z.object({
    label: z.string().optional(),
    name: z.string().optional(),
    placeholder: z.string().optional(),
    rows: z.number().default(4),
  }).optional(),
  disclaimer: z.object({ label: z.string().optional() }).optional(),
  button: z.string().optional().meta({ placeholder: 'Send message' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Contact',
    description: 'Contact form with custom fields',
    category: 'contact',
    icon: 'tabler:mail',
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle', 'description'] },
      { key: 'form', label: 'Form', fields: ['inputs', 'textarea', 'disclaimer', 'button'] },
    ],
  },
};
