import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { text } from '../_shared/content';

export const schema = z.object({
  label: text().optional().meta({ help: 'Above the count: "Launch day", "Starts in".' }),
  to: z.string().meta({ help: 'The moment, ISO 8601 with its offset: "2026-12-01T09:00:00Z".' }),
  date: z.string().meta({ help: 'The same moment in words, always shown: "1 December 2026 · 09:00 UTC".' }),
  done: z.string().default('It is live'),
  seconds: z.boolean().default(false),
  note: text().optional().meta({ help: 'A quiet line under the count.' }),
  card: z.enum(['none', 'canvas', 'surface']).default('none').meta({ help: 'A frame around it, for a hero aside.' }),
  elevated: z.boolean().default(false).meta({ help: 'With card: a shadow, for a card over a hero.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Countdown',
    description: 'The time left until a real launch or a live session, over the date in words.',
    category: 'content',
    icon: 'tabler:clock',
  },
};
