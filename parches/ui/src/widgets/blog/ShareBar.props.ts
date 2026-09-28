import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

// The Share element's networks.
const networks = ['x', 'facebook', 'linkedin', 'whatsapp', 'mail', 'copy'] as const;

export const schema = z.object({
  networks: z.array(z.enum(networks)).default(['x', 'linkedin', 'facebook', 'whatsapp', 'mail', 'copy']).meta({ help: 'In this order: direct buttons to where links are shared. copy: the link to the clipboard.' }),
  label: z.string().optional().meta({ help: 'Default: the blog\'s "Share".' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Share bar',
    description: "The post's share buttons in a column, for the rail beside the text (ArticleBody's `start`).",
    category: 'blog',
    icon: 'tabler:share',
  },
};
