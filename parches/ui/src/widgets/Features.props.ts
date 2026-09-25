import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { image, link, heading, headingGroup, text } from '../_shared/content';

export const layouts = ['grid', 'cards', 'list', 'panels', 'tiles', 'rows', 'gallery'] as const;
export const tones = ['neutral', 'primary', 'success', 'warning', 'danger'] as const;

const item = z.object({
  eyebrow: text().optional().meta({ help: 'The small caps line above the title: a duration, a channel, a month, "01". In rows, the left column.' }),
  title: text().optional(),
  aside: text().optional().meta({ help: 'Beside the title: a price in cards ("from €90"), the right column in rows.' }),
  description: text({ input: 'textarea' }).optional(),
  points: z.array(text()).default([]).meta({ help: 'Deliverables or specifics, one line each.' }),
  footer: text().optional().meta({ help: 'Pinned to the bottom: "From €55K · led by Núria", "Median 3h 10m", "Costs us: …".' }),
  icon: z.string().optional().meta({ input: 'icon' }),
  image: image.optional().meta({ help: 'On top of a card, or the tile image in gallery.' }),
  href: z.string().optional().meta({ help: 'Makes the whole item the link.' }),
  link: link.optional().meta({ help: 'A text link under the item: "Learn more".' }),
  tone: z.enum(tones).default('neutral').meta({ help: 'Colours the card edge and background (or, in rows, the eyebrow and footer): warning for a caveat, danger for a security door.' }),
  featured: z.boolean().default(false).meta({ help: 'The current or recommended one: accented edge and a shadow.' }),
});

export const schema = z.object({
  ...heading({ align: 'center' }),
  layout: z.enum(layouts).default('grid').meta({ help: 'grid: icon badge beside the text · cards: each item on a card · list: a compact list · panels: numbered cells between hairlines · tiles: small cells between hairlines · rows: rows between hairlines, eyebrow on the left and aside on the right · gallery: image tiles.' }),
  header: z.enum(['top', 'side']).default('top').meta({ help: 'side: the heading in a column beside the items.' }),
  items: z.array(item).default([]),
  columns: z.enum(['1', '2', '3', '4']).default('2').meta({ help: 'At most this many across; cards wrap to fewer on narrow screens.' }),
  accent: z.boolean().default(false).meta({ help: 'Eyebrows in the brand colour, as labels of a route ("Support", "Buying") rather than quiet facts.' }),
  asideStyle: z.enum(['figure', 'meta']).default('figure').meta({ help: 'figure: the aside as a price, in the heading face · meta: as a quiet fact in mono, a duration.' }),
  card: z.enum(['surface', 'canvas']).default('surface').meta({ help: 'The card colour: the surface on the page colour, or the page colour on a surface section.' }),
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
      { key: 'layout', label: 'Layout', fields: ['layout', 'header', 'columns', 'card', 'accent', 'asideStyle', 'defaultIcon', 'image'] },
    ],
  },
};
