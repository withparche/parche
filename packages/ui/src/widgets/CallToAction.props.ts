import { z } from 'zod';
import type { WidgetMeta } from '@parche/core/types';

const action = z.object({
  variant: z.enum(['primary', 'secondary', 'tertiary', 'link']).default('primary'),
  text: z.string().optional(),
  href: z.string().optional().meta({ placeholder: 'https://...' }),
  target: z.string().optional(),
  icon: z.string().optional().meta({ input: 'icon' }),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  actions: z.array(action).default([]),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Call to Action',
    description: 'Centered CTA panel with headline and action buttons',
    category: 'call-to-action',
    icon: 'tabler:click',
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle'] },
      { key: 'actions', label: 'Actions', fields: ['actions'] },
    ],
  },
};
