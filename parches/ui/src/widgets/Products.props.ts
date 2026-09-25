import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { heading, headingGroup, image, link, text } from '../_shared/content';

const product = z.object({
  name: text(),
  href: z.string().optional().meta({ help: 'The product page.' }),
  image: image.optional(),
  placeholder: z.string().optional().meta({ help: 'Until there is a photo: "product shot · 800×800".' }),
  badge: z.string().optional().meta({ help: 'On the photo: "Bestseller", "New".' }),
  price: z.string().meta({ help: 'As shown: "£248".' }),
  compareAt: z.string().optional().meta({ help: 'The price before a reduction, struck through.' }),
  stock: z
    .object({ label: z.string(), state: z.enum(['in', 'low', 'out']).default('in') })
    .optional()
    .meta({ help: '"In stock", "Only 3 left", "Sold out": green, amber, quiet.' }),
  rating: z.object({ value: z.number().min(0).max(5), count: z.number().int().optional() }).optional(),
  note: text().optional().meta({ help: 'A line instead of a rating: "Wax, thread, spare buckle".' }),
  restock: link.optional().meta({ help: 'Shown when sold out: "Email me when it is back".' }),
});

export const schema = z.object({
  ...heading(),
  items: z.array(product).default([]),
  columns: z.enum(['2', '3', '4', '5']).default('4').meta({ help: 'At most this many across.' }),
  ratio: z.enum(['1/1', '4/5', '4/3']).default('4/5'),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Products',
    description: 'Product cards for a shop: photo with a badge, name, price, stock that tells the truth, rating, and a restock link when sold out.',
    category: 'commerce',
    icon: 'tabler:shopping-bag',
  },
  ui: { groups: [headingGroup, { key: 'content', label: 'Products', fields: ['items'] }, { key: 'layout', label: 'Layout', fields: ['columns', 'ratio'] }] },
};
