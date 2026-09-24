import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { sourcedNumber } from '../_shared/content';

const stat = sourcedNumber.extend({
  icon: z.string().optional().meta({ input: 'icon' }),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  stats: z.array(stat).default([]),
  note: z.string().optional().meta({ help: 'One line under the numbers: the window, the method, the caveat.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Stats',
    description: 'Numbers a sceptic can check: each with its unit, its source and its date, linked to the report when there is one.',
    category: 'stats',
    icon: 'tabler:chart-bar',
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle'] },
      { key: 'content', label: 'Numbers', fields: ['stats', 'note'] },
    ],
  },
};
