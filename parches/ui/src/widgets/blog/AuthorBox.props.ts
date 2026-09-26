import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  action: z
    .object({ text: z.string(), href: z.string() })
    .optional()
    .meta({ help: 'On a blog with one writer: the button after "Written by", usually the subscription.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Author box',
    description: 'Who wrote the post: "Written by" and one next step on a one-writer blog; bio and "More from" on a blog with several.',
    category: 'blog',
    icon: 'tabler:user',
  },
};
