import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { image, link, heading, headingGroup } from '../_shared/content';

export const layouts = ['grid', 'cards', 'list', 'panels', 'tiles'] as const;

const item = z.object({
  title: z.string().optional(),
  description: z.string().optional().meta({ input: 'textarea' }),
  icon: z.string().optional().meta({ input: 'icon' }),
  link: link.optional().meta({ help: 'A text link under the item: "Learn more".' }),
});

export const schema = z.object({
  ...heading({ align: 'center' }),
  layout: z.enum(layouts).default('grid').meta({ help: 'grid: icon badge beside the text · cards: each item on a card · list: a compact list · panels: numbered cells between hairlines · tiles: small name-and-role cells between hairlines.' }),
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
      headingGroup,
      { key: 'content', label: 'Content', fields: ['items'] },
      { key: 'layout', label: 'Layout', fields: ['layout', 'columns', 'defaultIcon', 'image'] },
    ],
  },
};
