import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  title: z.string().optional().meta({ help: 'Default: "Comments".' }),
  note: z.string().optional().meta({ help: 'Moderation and privacy, beside the button. Default: the blog label.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Comments',
    description: 'The discussion under a post (giscus), loaded late and after consent. Nothing until comments are configured.',
    category: 'blog',
    icon: 'tabler:messages',
  },
};
