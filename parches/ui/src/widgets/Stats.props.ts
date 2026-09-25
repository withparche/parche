import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { sourcedNumber, heading, headingGroup } from '../_shared/content';

const stat = sourcedNumber.extend({
  icon: z.string().optional().meta({ input: 'icon' }),
  tone: z.enum(['default', 'success', 'warning']).default('default').meta({ help: 'Colour the figure: success for a number that is good by its threshold.' }),
});

export const schema = z.object({
  ...heading({ align: 'center' }),
  items: z.array(stat).default([]),
  layout: z.enum(['figures', 'cards']).default('figures').meta({ help: 'figures: large numbers in a row · cards: compact bordered cards, for beside a screenshot or under a hero.' }),
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
      headingGroup,
      { key: 'content', label: 'Numbers', fields: ['items', 'note'] },
      { key: 'layout', label: 'Layout', fields: ['layout'] },
    ],
  },
};
