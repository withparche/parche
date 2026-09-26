import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { heading, headingGroup } from '../_shared/content';

export const schema = z.object({
  ...heading(),
  label: z.string().optional().meta({ help: 'The line at the top of the card: "What it costs you to keep doing this".' }),
  inputs: z
    .array(
      z.object({
        name: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/).meta({ help: 'The name the formulas use: "calls".' }),
        label: z.string(),
        value: z.number(),
        min: z.number().default(0),
        max: z.number().optional(),
        step: z.number().default(1),
        control: z.enum(['stepper', 'range']).default('stepper'),
        prefix: z.string().optional(),
        suffix: z.string().optional(),
      }),
    )
    .min(1),
  results: z
    .array(
      z.object({
        label: z.string().default(''),
        formula: z.string().meta({ help: 'Arithmetic on the input names: "calls * hours * 0.5"; also min, max, round, floor, ceil.' }),
        decimals: z.number().int().min(0).max(4).default(0),
        prefix: z.string().optional(),
        suffix: z.string().optional(),
        note: z.string().optional().meta({ help: 'The assumption behind the number.' }),
      }),
    )
    .min(1),
  share: z
    .object({ label: z.string().default('Copy this result'), copiedLabel: z.string().default('Link copied'), note: z.string().optional() })
    .optional()
    .meta({ help: 'Keep the numbers in the URL and offer to copy the link.' }),
  locale: z.string().default('en-GB'),
  card: z.enum(['canvas', 'surface', 'none']).default('canvas').meta({ help: 'The frame around the numbers; none sits them on the page.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Calculator',
    description: 'Numbers the reader sets and what they come to: the cost of waiting, seats times price.',
    category: 'content',
    icon: 'tabler:calculator',
  },
  ui: {
    groups: [
      headingGroup,
      { key: 'content', label: 'Numbers', fields: ['label', 'inputs', 'results', 'share', 'locale'] },
      { key: 'style', label: 'Style', fields: ['card'] },
    ],
  },
};
