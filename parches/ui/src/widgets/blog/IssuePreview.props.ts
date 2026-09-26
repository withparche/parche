import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  caption: z.string().optional().meta({ help: 'Under the preview: why a real past issue is shown.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Issue preview',
    description: 'The latest post as it arrives in an inbox, with a link to read it: what a subscriber actually gets.',
    category: 'blog',
    icon: 'tabler:mail-opened',
  },
};
