import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  icon: z.string().default('tabler:info-square').meta({ input: 'icon' }),
  title: z.string().optional(),
  description: z.string().optional().meta({ input: 'textarea', markdown: 'inline' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    // Renders edge to edge and owns its padding: never wrapped as a page root.
    wrapper: false,
    label: 'Note',
    description: 'Simple info banner with icon and text',
    category: 'content',
    icon: 'tabler:info-circle',
  },
};
