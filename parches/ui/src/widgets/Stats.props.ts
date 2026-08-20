import { z } from 'zod';
import type { WidgetMeta } from '@parche/core/types';

const stat = z.object({
  amount: z.string().optional().meta({ placeholder: '10K+' }),
  title: z.string().optional(),
  icon: z.string().optional().meta({ input: 'icon' }),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  stats: z.array(stat).default([]),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Stats',
    description: 'Statistics grid with large numbers and labels',
    category: 'stats',
    icon: 'tabler:chart-bar',
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle'] },
      { key: 'content', label: 'Stats', fields: ['stats'] },
    ],
  },
};
