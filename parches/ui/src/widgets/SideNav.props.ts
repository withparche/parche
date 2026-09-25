import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

const navLink = z.object({ label: z.string(), href: z.string() });

export const schema = z.object({
  items: z
    .array(z.object({ title: z.string().optional(), links: z.array(navLink) }))
    .default([])
    .meta({ help: 'Groups of links, usually a menu: { "$ref": "navigation/docs" }. The link to the current page is marked.' }),
  label: z.string().default('Section navigation').meta({ help: 'The navigation landmark\'s name.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Side navigation',
    description: 'Grouped links down the side of a docs or guide layout, with the current page marked.',
    category: 'navigation',
    icon: 'tabler:layout-sidebar',
    wrapper: false,
  },
};
