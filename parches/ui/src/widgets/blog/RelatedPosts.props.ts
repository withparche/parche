import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  posts: z.array(z.unknown()).default([]),
  title: z.string().optional(),
  linkText: z.string().optional(),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Related posts',
    description: 'Posts related to the one being read, after its body.',
    category: 'blog',
    // Renders its own full-width Section and Container: never wrapped as a root.
    wrapper: false,
  },
};
