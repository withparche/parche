import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { link, text } from '../_shared/content';

export const schema = z.object({
  tone: z.enum(['neutral', 'primary', 'success', 'warning', 'danger']).default('neutral').meta({ help: 'warning: what we turn down, a gap · success: a guarantee, a live signal · primary: a tip, a choice · neutral: a quiet panel.' }),
  layout: z.enum(['card', 'bar', 'inline']).default('card').meta({ help: 'card: a panel · bar: a rule on the left, inside prose · inline: one row, a trust line or an activity signal.' }),
  label: text().optional().meta({ help: '"What we turn down", "Tip", "Trust".' }),
  title: text().optional(),
  description: text({ input: 'textarea' }).optional(),
  items: z.array(text()).default([]).meta({ help: 'One line each; start with **a bold lead.** when the list is reasons.' }),
  footer: text().optional(),
  link: link.optional(),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Callout',
    description: 'A notice set apart from the flow: what we turn down, what is not built yet, a guarantee, a tip, a trust line.',
    category: 'content',
    icon: 'tabler:info-square-rounded',
  },
  ui: {
    groups: [
      { key: 'content', label: 'Content', fields: ['label', 'title', 'description', 'items', 'footer', 'link'] },
      { key: 'look', label: 'Look', fields: ['tone', 'layout'] },
    ],
  },
};
