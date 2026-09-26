import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { action, text } from '../_shared/content';

export const schema = z.object({
  text: text().meta({ help: 'What the one action gets you: "Get the landing page checklist".' }),
  note: text().optional().meta({ help: 'A quiet fact beside it: "Two fields · no sequence".' }),
  action: action,
  position: z.enum(['bottom', 'top']).default('bottom'),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Sticky bar',
    description: 'The page\'s one action, following the reader once the hero is behind them; it steps aside at the footer.',
    category: 'cta',
    icon: 'tabler:layout-bottombar',
    // Fixed to the viewport: it sits in no band.
    wrapper: false,
  },
};
