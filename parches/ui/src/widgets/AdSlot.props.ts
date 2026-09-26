import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  slot: z.string().meta({ help: 'The placement: its unit comes from the ads configuration (indexLeaderboard, inFeed, inArticle, articleSidebar, articleEnd, or your own name).' }),
  size: z.enum(['leaderboard', 'rectangle', 'large-rectangle', 'half-page']).default('rectangle').meta({ help: 'leaderboard 728×90 (320×100 on phones) · rectangle 300×250 · large-rectangle 336×280 · half-page 300×600, sticky, wide screens only.' }),
  label: z.string().optional().meta({ help: 'Default: "Advertisement".' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Ad slot',
    description: 'An ad in a named placement, its height reserved and labelled, loaded after consent. Nothing until ads are configured.',
    category: 'blog',
    icon: 'tabler:ad',
  },
};
