import { z } from 'zod';
import type { WidgetMeta } from '@parche/core/types';

export const schema = z.object({
  title: z.string().optional(),
  description: z.string().optional().meta({ input: 'textarea' }),
  href: z.string().optional().meta({ placeholder: 'https://...' }),
  badge: z.string().optional().meta({ placeholder: 'New' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Announcement',
    description: 'Top banner announcement with badge and link',
    category: 'content',
    icon: 'tabler:speakerphone',
  },
};
