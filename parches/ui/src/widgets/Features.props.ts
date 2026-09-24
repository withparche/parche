import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { image } from '../_shared/content';

export const styles = ['grid', 'cards', 'list'] as const;

const item = z.object({
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
  style: z.enum(styles).default('grid').meta({ help: 'grid: icon badge beside the text · cards: each item on a card · list: a compact list, with the media above.' }),
  tagline: z.string().optional().meta({ placeholder: 'e.g. FEATURES' }),
  title: z.string().optional().meta({ help: 'Main heading of the section' }),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  items: z.array(item).default([]),
  columns: z.enum(['2', '3', '4']).default('2').meta({ help: 'Number of grid columns' }),
  defaultIcon: z.string().optional().meta({ input: 'icon', help: 'Fallback icon when an item has none' }),
  image: image.optional().meta({ help: 'Shown above the items when the media slot is empty.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Features',
    description: 'A headline and a grid of features, as icon rows, cards or a list, with an optional media block.',
    category: 'features',
    icon: 'tabler:layout-grid',
  },
  slots: {
    media: { label: 'Media', help: 'Above the items, replacing the image: a screenshot, a video, a code block.', max: 1 },
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle'] },
      { key: 'content', label: 'Content', fields: ['items'] },
      { key: 'layout', label: 'Layout', fields: ['style', 'columns', 'defaultIcon', 'image'] },
    ],
  },
};
