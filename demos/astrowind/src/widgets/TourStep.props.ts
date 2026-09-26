import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

// One step of a product tour: the screen on one side, what it does and one
// action on the other. A project widget, so a Switch of steps stays within
// the depth limit instead of nesting Columns and Column inside each option.
export const schema = z.object({
  screen: z.object({
    url: z.string().meta({ help: 'The bar over the screen: "src/config.yaml · 1200×760".' }),
    badge: z.string().optional().meta({ help: '"Step 1 of 4".' }),
    caption: z.string().optional(),
    ratio: z.string().default('16/10'),
  }),
  title: z.string(),
  subtitle: z.string().optional(),
  action: z.object({ text: z.string(), href: z.string() }).optional(),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Tour step',
    description: 'One screen of a product tour beside what it does and one action.',
    category: 'content',
    icon: 'tabler:device-desktop',
  },
};
