import { z } from 'zod';
import type { WidgetMeta } from '@parche/core/types';

const action = z.object({
  variant: z.enum(['primary', 'secondary', 'tertiary', 'link']).default('primary'),
  text: z.string().optional(),
  href: z.string().optional().meta({ placeholder: 'https://...' }),
  target: z.string().optional().meta({ placeholder: '_blank' }),
  icon: z.string().optional().meta({ input: 'icon' }),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional().meta({ help: 'Main hero heading (h1)' }),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  content: z.string().optional().meta({ input: 'textarea' }),
  actions: z.array(action).default([]),
  image: z.object({
    src: z.string().optional(),
    alt: z.string().optional(),
  }).optional(),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Hero Split',
    description: 'Split hero with text on left and image on right',
    category: 'hero',
    icon: 'tabler:layout-sidebar-right',
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle', 'content'] },
      { key: 'actions', label: 'Actions', fields: ['actions'] },
      { key: 'media', label: 'Media', fields: ['image'] },
    ],
  },
};
