import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const tones = ['default', 'muted', 'success', 'warning', 'danger', 'primary'] as const;
export const sizes = ['sm', 'md', 'lg'] as const;

const cell = z.union([
  z.string(),
  z.object({ text: z.string(), tone: z.enum(tones).optional().meta({ help: 'success for a win, warning for "they win this" or a gap, muted for a quiet value.' }) }),
]);

const column = z.object({
  label: z.string().default('').meta({ help: 'Header text; empty for the row-label column.' }),
  align: z.enum(['start', 'end']).default('start'),
  highlight: z.boolean().default(false).meta({ help: 'The column being argued for: its header is tinted and its plain values are stated, not quiet.' }),
  mono: z.boolean().default(false).meta({ help: 'Values in the mono face: file names, hours, durations.' }),
  width: z.string().optional().meta({ help: 'A CSS width for the column, e.g. "38%".' }),
});

export const schema = z.object({
  columns: z.array(column).default([]).meta({ help: 'One per column, the row labels first.' }),
  rows: z
    .array(z.object({ cells: z.array(cell), tone: z.enum(tones).optional().meta({ help: 'Tints the whole row: a known gap, a warning.' }) }))
    .default([]),
  footer: z.array(cell).optional().meta({ help: 'A total row.' }),
  header: z.enum(['names', 'labels', 'none']).default('names').meta({ help: 'names: the first header cell is a label, the others name what is compared · labels: every header cell is a label · none: no header row (a spec list).' }),
  size: z.enum(sizes).default('md').meta({ help: 'Cell padding and text size: sm for dense matrices, lg for a comparison under pricing cards.' }),
  frame: z.enum(['card', 'open']).default('card').meta({ help: 'card: a bordered, scrolling box · open: rows between hairlines with no box, for key and value lists.' }),
  variant: z.enum(['canvas', 'surface']).default('canvas').meta({ help: 'The card colour: the page colour (on a surface section) or the surface (on the page colour).' }),
  radius: z.enum(['md', 'lg']).default('md'),
  stickyFirst: z.boolean().default(false).meta({ help: 'Keep the row labels in view while a wide table scrolls.' }),
  minWidth: z.number().int().positive().optional().meta({ help: 'Scroll below this width instead of squeezing; defaults by column count.' }),
  caption: z.string().optional().meta({ help: 'The accessible name of the table.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Table',
    description: 'Rows and columns of facts: a comparison with quantities, a spec list, a matrix.',
    tokens: ['color-border', 'color-border-soft', 'color-heading', 'color-muted', 'color-surface', 'color-background', 'color-primary-soft', 'color-success', 'color-warning', 'color-danger', 'color-primary', 'color-warning-soft', 'color-success-soft', 'color-danger-soft'],
    parts: [
      { name: 'root', element: 'div', description: 'The scrolling frame.' },
      { name: 'table', element: 'table' },
      { name: 'head', element: 'thead' },
      { name: 'row', element: 'tr', states: ['default', 'muted', 'success', 'warning', 'danger', 'primary'] },
      { name: 'foot', element: 'tfoot', description: 'The total row.' },
    ],
  },
  ui: {
    groups: [
      { key: 'content', label: 'Content', fields: ['columns', 'rows', 'footer', 'caption'] },
      { key: 'look', label: 'Look', fields: ['header', 'size', 'frame', 'variant', 'radius', 'stickyFirst', 'minWidth'] },
    ],
  },
});
