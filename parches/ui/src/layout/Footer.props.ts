import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

const link = z.object({ label: z.string(), href: z.string(), icon: z.string().optional().meta({ input: 'icon' }) });

export const schema = z.object({
  columns: z.array(z.object({ title: z.string(), links: z.array(link) })).default([]),
  secondaryLinks: z.array(link).optional(),
  socialLinks: z.array(link).optional(),
  footNote: z.string().optional().meta({ input: 'textarea' }),
  copyright: z.string().optional(),
  siteName: z.string().optional(),
  theme: z.string().optional(),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Footer',
    description: 'The site footer: link columns, secondary and social links, a note and the copyright line.',
    category: 'layout',
    icon: 'tabler:layout-bottombar',
    // Chrome: a layout root, never wrapped, not offered in the palette.
    wrapper: false,
    hidden: true,
  },
};
