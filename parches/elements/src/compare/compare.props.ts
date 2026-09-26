import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

const side = z.object({
  src: z.string().optional(),
  alt: z.string().default(''),
  label: z.string().meta({ help: 'The chip on this side: "before · 4.1 s · 820 KB".' }),
  tone: z.enum(['neutral', 'success', 'warning']).default('neutral'),
  placeholder: z.string().optional().meta({ help: 'Until there is an image: what it is and its size.' }),
});

export const schema = z.object({
  before: side,
  after: side,
  ratio: z.string().default('16/9'),
  start: z.number().min(0).max(100).default(50).meta({ help: 'Where the divider starts, in percent from the left.' }),
  label: z.string().default('Drag to compare').meta({ help: 'The slider\'s accessible name.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Compare',
    description: 'Before and after in one frame, split by a divider the reader drags.',
    tokens: ['color-primary', 'color-border', 'color-surface', 'color-success-soft', 'color-success', 'color-warning-soft', 'color-warning', 'color-heading'],
    tag: { name: 'parche-compare', entry: './compare.element.ts' },
    keyboard: { 'ArrowLeft / ArrowRight': 'Move the divider (the native range input).', 'Home / End': 'All before, or all after.' },
    noJs: 'The frame shows half of each side at the starting split; the slider is inert.',
    parts: [
      { name: 'root', element: 'parche-compare' },
      { name: 'frame', element: 'div' },
      { name: 'after', element: 'div' },
      { name: 'before', element: 'div', description: 'Clipped to the divider.' },
      { name: 'chip', element: 'span' },
      { name: 'handle', element: 'span' },
      { name: 'range', element: 'input' },
    ],
  },
});
