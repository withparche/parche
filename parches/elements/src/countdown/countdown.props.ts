import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  to: z.string().meta({ help: 'The moment, ISO 8601 with its offset: "2026-12-01T18:00:00+01:00".' }),
  date: z.string().meta({ help: 'The same moment as people read it, shown without script and under the count: "1 December · 18:00 CET".' }),
  done: z.string().default('It is live').meta({ help: 'Shown once the moment has passed.' }),
  units: z.object({ days: z.string().default('days'), hours: z.string().default('hours'), minutes: z.string().default('min'), seconds: z.string().default('sec') }).prefault({}),
  seconds: z.boolean().default(false).meta({ help: 'Count the seconds too. Off by default: a ticking second pulls the eye.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Countdown',
    description: 'The time left until a launch or a live session, with the date itself always shown.',
    tokens: ['color-border', 'color-surface', 'color-heading', 'color-muted'],
    tag: { name: 'parche-countdown', entry: './countdown.element.ts' },
    keyboard: { None: 'Static content.' },
    noJs: 'The date and time are shown as text; only the count needs script.',
    parts: [
      { name: 'root', element: 'parche-countdown', states: ['counting', 'done'] },
      { name: 'units', element: 'dl' },
      { name: 'unit', element: 'div' },
      { name: 'value', element: 'dd' },
      { name: 'date', element: 'p' },
    ],
  },
});
