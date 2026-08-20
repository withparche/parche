import { z } from 'zod';
import type { WidgetMeta } from '@parche/core/types';

const stepItem = z.object({
  title: z.string().optional(),
  description: z.string().optional().meta({ input: 'textarea' }),
  icon: z.string().optional().meta({ input: 'icon' }),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  items: z.array(stepItem).default([]),
  image: z.object({
    src: z.string().optional(),
    alt: z.string().optional(),
  }).optional(),
  isReversed: z.boolean().default(false).meta({ help: 'Swap timeline and image sides' }),
  callToAction: z.object({
    text: z.string().optional(),
    href: z.string().optional().meta({ placeholder: 'https://...' }),
    icon: z.string().optional().meta({ input: 'icon' }),
  }).optional(),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Steps',
    description: 'Timeline steps with optional image',
    category: 'steps',
    icon: 'tabler:list-numbers',
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle'] },
      { key: 'content', label: 'Steps', fields: ['items', 'callToAction'] },
      { key: 'media', label: 'Media', fields: ['image'] },
      { key: 'layout', label: 'Layout', fields: ['isReversed'] },
    ],
  },
};
