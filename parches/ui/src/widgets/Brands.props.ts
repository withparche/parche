import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  icons: z.array(z.string()).default([]).meta({ help: 'Icon names (e.g. tabler:brand-github)' }),
  images: z.array(z.object({ src: z.string().optional(), alt: z.string().optional() })).default([]),
  layout: z.enum(['wrap', 'carousel']).default('wrap').meta({ help: 'Wrapped rows, or a carousel four per view.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Brands',
    description: 'Logo/brand showcase strip',
    category: 'social-proof',
    icon: 'tabler:building',
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle'] },
      { key: 'content', label: 'Brands', fields: ['icons', 'images'] },
      { key: 'layout', label: 'Layout', fields: ['layout'] },
    ],
  },
};
