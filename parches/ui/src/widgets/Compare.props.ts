import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { heading, headingGroup } from '../_shared/content';

const side = z.object({
  image: z.object({ src: z.string(), alt: z.string().default('') }).optional(),
  label: z.string().meta({ help: 'The chip on this side: "after · 0.4 s · 38 KB".' }),
  tone: z.enum(['neutral', 'success', 'warning']).default('neutral'),
  placeholder: z.string().optional(),
});

export const schema = z.object({
  ...heading(),
  before: side,
  after: side,
  ratio: z.string().default('16/9'),
  label: z.string().default('Drag to compare'),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Compare',
    description: 'Before and after in one frame, split by a divider the reader drags.',
    category: 'media',
    icon: 'tabler:arrows-horizontal',
  },
  ui: { groups: [headingGroup, { key: 'content', label: 'Before and after', fields: ['before', 'after', 'ratio', 'label'] }] },
};
