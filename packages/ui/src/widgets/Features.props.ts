import { z } from 'zod';
import type { WidgetMeta } from '@parche/core/types';

const featureItem = z.object({
  title: z.string().optional(),
  description: z.string().optional().meta({ input: 'textarea' }),
  icon: z.string().optional().meta({ input: 'icon' }),
  callToAction: z
    .object({
      text: z.string().optional().meta({ placeholder: 'Learn more' }),
      href: z.string().optional().meta({ label: 'URL', placeholder: 'https://...' }),
    })
    .optional(),
});

export const schema = z.object({
  tagline: z.string().optional().meta({ placeholder: 'e.g. FEATURES' }),
  title: z.string().optional().meta({ help: 'Main heading of the section' }),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  items: z.array(featureItem).default([]),
  columns: z.enum(['2', '3', '4']).default('2').meta({ help: 'Number of grid columns' }),
  defaultIcon: z.string().optional().meta({ input: 'icon', help: 'Fallback icon when item has none' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Features',
    description: 'Grid of features with circular icons, titles, and descriptions',
    category: 'features',
    icon: 'tabler:layout-grid',
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle'] },
      { key: 'content', label: 'Content', fields: ['items'] },
      { key: 'layout', label: 'Layout', fields: ['columns', 'defaultIcon'] },
    ],
  },
};
