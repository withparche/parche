import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const tones = ['neutral', 'primary', 'success', 'warning', 'danger'] as const;
export const layouts = ['card', 'bar', 'inline'] as const;

export const schema = z.object({
  tone: z.enum(tones).default('neutral').meta({ help: 'neutral: a quiet panel · primary: a tip or a choice · success: a guarantee, a live signal · warning: what we turn down, a gap, a caveat · danger: a hazard.' }),
  layout: z.enum(layouts).default('card').meta({ help: 'card: a panel with a label, text and a list · bar: a rule on the left, for a tip inside prose · inline: one wrapping row, for a trust line or an activity signal.' }),
  label: z.string().optional().meta({ help: 'The small caps line on top: "What we turn down", "Tip".' }),
  title: z.string().optional(),
  description: z.string().optional().meta({ input: 'textarea' }),
  items: z.array(z.string()).default([]).meta({ help: 'A list, one line each ("**Lead.** text"); in inline, links separated by dots.' }),
  rows: z.array(z.object({ label: z.string(), value: z.string(), tone: z.enum(tones).optional() })).default([]).meta({ help: 'Key and value rows between hairlines, in a card: hours, a budget, an address.' }),
  footer: z.string().optional().meta({ help: 'Under a rule at the bottom (card), or the quiet source at the end (inline).' }),
  link: z.object({ text: z.string(), href: z.string() }).optional(),
  elevated: z.boolean().default(false).meta({ help: 'A card that stands out: the surface colour, a shadow and the label in the brand colour.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Callout',
    description: 'A notice set apart from the flow: a caveat, a guarantee, a tip, a trust line.',
    tokens: ['color-border', 'color-surface-2', 'color-heading', 'color-text', 'color-muted', 'color-primary', 'color-primary-soft', 'color-success', 'color-success-soft', 'color-warning', 'color-warning-soft', 'color-danger', 'color-danger-soft'],
    parts: [
      { name: 'root', element: 'aside', states: ['neutral', 'primary', 'success', 'warning', 'danger'] },
      { name: 'label', element: 'p' },
      { name: 'title', element: 'p' },
      { name: 'description', element: 'p' },
      { name: 'items', element: 'ul' },
      { name: 'rows', element: 'dl' },
      { name: 'actions', element: 'div', description: 'The `actions` slot: buttons stacked full width.' },
      { name: 'footer', element: 'p' },
    ],
  },
  ui: { groups: [{ key: 'content', label: 'Content', fields: ['label', 'title', 'description', 'items', 'rows', 'footer', 'link'] }, { key: 'look', label: 'Look', fields: ['tone', 'layout'] }] },
});
