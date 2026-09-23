import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  ratio: z
    .string()
    .regex(/^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/, 'width / height, e.g. "16/9"')
    .default('16/9')
    .meta({ help: 'Width over height: "16/9", "4/3", "1/1", "2.35/1".' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'AspectRatio',
    description: 'A box that keeps a width-to-height ratio, and fills its child to it.',
    tokens: [],
    parts: [{ name: 'root', element: 'div', description: 'The box; its first child stretches to fill it.' }],
  },
});
