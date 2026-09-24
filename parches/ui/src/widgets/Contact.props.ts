import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

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
  action: z.string().optional().meta({ help: 'Where the form posts.' }),
  note: z.string().optional().meta({ help: 'One line under the button.' }),
  layout: z.enum(['centered', 'split']).default('centered').meta({ help: 'centered: the form under the heading · split: the heading and the booking card on the left, the form on the right.' }),
  booking: z
    .object({
      title: z.string().default('Next available'),
      badge: z.string().optional().meta({ help: '"3 slots left".' }),
      slots: z.array(z.object({ label: z.string(), href: z.string().optional(), selected: z.boolean().default(false) })).default([]),
      note: z.string().optional().meta({ help: '"Times in your local zone · 25 min".' }),
    })
    .optional()
    .meta({ help: 'Bookable slots beside the form, each a link to the booking page.' }),
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
