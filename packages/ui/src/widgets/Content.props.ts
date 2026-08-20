import { z } from 'zod';
import type { WidgetMeta } from '@parche/core/types';

const contentItem = z.object({
  title: z.string().optional(),
  description: z.string().optional().meta({ input: 'textarea' }),
  icon: z.string().optional().meta({ input: 'icon' }),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  content: z.string().optional().meta({ input: 'textarea', help: 'Rich text/HTML content' }),
  image: z.object({
    src: z.string().optional(),
    alt: z.string().optional(),
  }).optional(),
  items: z.array(contentItem).default([]),
  columns: z.enum(['1', '2', '3']).default('1').meta({ help: 'Columns for items list' }),
  isReversed: z.boolean().default(false).meta({ help: 'Swap text and image sides' }),
  isAfterContent: z.boolean().default(false).meta({ help: 'Reduce top padding when following another Content' }),
  callToAction: z.object({
    text: z.string().optional(),
    href: z.string().optional().meta({ placeholder: 'https://...' }),
    icon: z.string().optional().meta({ input: 'icon' }),
  }).optional(),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Content',
    description: 'Two-column content with text/items on one side and image on the other',
    category: 'content',
    icon: 'tabler:layout-sidebar',
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle'] },
      { key: 'body', label: 'Body', fields: ['content', 'items', 'callToAction'] },
      { key: 'media', label: 'Media', fields: ['image'] },
      { key: 'layout', label: 'Layout', fields: ['columns', 'isReversed', 'isAfterContent'] },
    ],
  },
};
