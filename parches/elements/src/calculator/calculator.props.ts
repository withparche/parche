import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  inputs: z
    .array(
      z.object({
        name: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/).meta({ help: 'The name the formulas use: "calls", "rate".' }),
        label: z.string(),
        value: z.number(),
        min: z.number().default(0),
        max: z.number().optional(),
        step: z.number().default(1),
        control: z.enum(['stepper', 'range']).default('stepper').meta({ help: 'stepper: − and + around the number · range: a slider.' }),
        prefix: z.string().optional().meta({ help: '"€".' }),
        suffix: z.string().optional().meta({ help: '"/h", "people".' }),
      }),
    )
    .min(1),
  results: z
    .array(
      z.object({
        label: z.string(),
        formula: z.string().meta({ help: 'Arithmetic on the input names: "calls * hours * 0.5". Also min, max, round, floor, ceil.' }),
        decimals: z.number().int().min(0).max(4).default(0),
        prefix: z.string().optional(),
        suffix: z.string().optional().meta({ help: '" hours / month".' }),
        note: z.string().optional().meta({ help: 'A quiet line under the result: the assumption behind it.' }),
      }),
    )
    .min(1),
  share: z
    .object({
      label: z.string().default('Copy this result'),
      copiedLabel: z.string().default('Link copied'),
      note: z.string().optional().meta({ help: 'Who to send it to: "Send it to whoever approves the budget."' }),
    })
    .optional()
    .meta({ help: 'Keep the inputs in the URL and offer to copy the link, so a result can be sent to someone.' }),
  locale: z.string().default('en-GB').meta({ help: 'How numbers are grouped: "en-GB", "es-ES".' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Calculator',
    description: 'A few numbers the reader sets and the results a formula makes of them, with a link that keeps the answer.',
    tokens: ['color-border', 'color-surface', 'color-heading', 'color-muted', 'color-primary'],
    tag: { name: 'parche-calculator', entry: './calculator.element.ts' },
    keyboard: {
      'ArrowUp / ArrowDown': 'On a number: one step up or down (the native number input).',
      'ArrowLeft / ArrowRight': 'On a slider: one step.',
    },
    noJs: 'The inputs show their starting values and the results are computed for them on the server.',
    parts: [
      { name: 'root', element: 'parche-calculator' },
      { name: 'input', element: 'div' },
      { name: 'decrement', element: 'button' },
      { name: 'increment', element: 'button' },
      { name: 'result', element: 'div' },
      { name: 'echo', element: 'output' },
      { name: 'value', element: 'output' },
      { name: 'link', element: 'code' },
      { name: 'share', element: 'button' },
    ],
  },
});
