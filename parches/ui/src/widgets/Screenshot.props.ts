import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { image } from '../_shared/content';

export const schema = z.object({
  image: image.optional().meta({ help: 'The screenshot. Without one, a striped placeholder captioned with what goes there.' }),
  caption: z.string().default('screenshot').meta({ help: 'The placeholder caption, with the size to deliver: "hero screenshot · 1200×900".' }),
  ratio: z.string().default('4/3'),
  url: z.string().optional().meta({ help: 'The address in the window bar.' }),
  badge: z.string().optional().meta({ help: 'A chip in the bar: "LCP 0.4s".' }),
  badgeTone: z.enum(['success', 'warning', 'primary', 'muted']).default('success'),
  frame: z.boolean().default(true).meta({ help: 'Draw the browser window around it.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Screenshot',
    description: 'A product screenshot in a browser window, or a captioned placeholder until the real one exists.',
    category: 'media',
    icon: 'tabler:browser',
  },
};
