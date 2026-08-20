import { z } from 'zod';
import type { WidgetMeta } from '@parche/core/types';

export const schema = z.object({
  icon: z.string().default('tabler:info-square').meta({ input: 'icon' }),
  title: z.string().optional(),
  description: z.string().optional().meta({ input: 'textarea' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Note',
    description: 'Simple info banner with icon and text',
    category: 'content',
    icon: 'tabler:info-circle',
  },
};
