import { z } from 'zod';
import type { WidgetMeta } from '@parche/core/types';

const featureItem = z.object({
  title: z.string().optional(),
  description: z.string().optional().meta({ input: 'textarea' }),
  icon: z.string().optional().meta({ input: 'icon' }),
  callToAction: z.object({
    text: z.string().optional(),
    href: z.string().optional().meta({ label: 'URL', placeholder: 'https://...' }),
  }).optional(),
  image: z.object({ src: z.string().optional(), alt: z.string().optional() }).optional(),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  items: z.array(featureItem).default([]),
  columns: z.enum(['2', '3', '4']).default('3').meta({ help: 'Number of grid columns' }),
  defaultIcon: z.string().optional().meta({ input: 'icon' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Features Card',
    description: 'Card-style features grid with images or icons',
    category: 'features',
    icon: 'tabler:cards',
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle'] },
      { key: 'content', label: 'Content', fields: ['items'] },
      { key: 'layout', label: 'Layout', fields: ['columns', 'defaultIcon'] },
    ],
  },
};
