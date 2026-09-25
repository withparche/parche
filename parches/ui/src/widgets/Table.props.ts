import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { heading, headingGroup, text } from '../_shared/content';

// The content shape of the Table element (elements/src/table/table.props.ts),
// repeated here so a page validates against it; the element renders it.
const tones = ['default', 'muted', 'success', 'warning', 'danger', 'primary'] as const;
const cell = z.union([text(), z.object({ text: text(), tone: z.enum(tones).optional() })]);

export const schema = z.object({
  ...heading(),
  columns: z
    .array(
      z.object({
        label: z.string().default(''),
        align: z.enum(['start', 'end']).default('start'),
        highlight: z.boolean().default(false).meta({ help: 'The column being argued for: tinted header, stated values.' }),
        mono: z.boolean().default(false),
        width: z.string().optional(),
      }),
    )
    .default([])
    .meta({ help: 'One per column, the row labels first.' }),
  rows: z.array(z.object({ cells: z.array(cell), tone: z.enum(tones).optional() })).default([]).meta({ help: 'Quantities, not ticks. A cell may be { text, tone }.' }),
  footer: z.array(cell).optional().meta({ help: 'A total row.' }),
  note: text({ input: 'textarea' }).optional().meta({ help: 'Under the table: the source, the date, the caveat.' }),
  header: z.enum(['names', 'labels', 'none']).default('names'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  frame: z.enum(['card', 'open']).default('card'),
  variant: z.enum(['canvas', 'surface']).default('canvas'),
  radius: z.enum(['md', 'lg']).default('md'),
  stickyFirst: z.boolean().default(false),
  minWidth: z.number().int().positive().optional(),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Table',
    description: 'A comparison, a spec list or a matrix, with quantities instead of ticks and a note on where the numbers come from.',
    category: 'content',
    icon: 'tabler:table',
  },
  ui: {
    groups: [
      headingGroup,
      { key: 'content', label: 'Table', fields: ['columns', 'rows', 'footer', 'note'] },
      { key: 'look', label: 'Look', fields: ['header', 'size', 'frame', 'variant', 'radius', 'stickyFirst', 'minWidth'] },
    ],
  },
};
