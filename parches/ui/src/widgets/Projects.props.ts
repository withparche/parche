import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { action, actionVariants, heading, headingGroup } from '../_shared/content';

/** Card links default to the quiet button: a card has several. */
const cardAction = action.extend({ variant: z.enum(actionVariants).default('secondary') });

const project = z.object({
  title: z.string().optional(),
  description: z.string().optional().meta({ input: 'textarea' }),
  image: z.object({ src: z.string().optional(), alt: z.string().optional() }).optional(),
  date: z.string().optional().meta({ placeholder: 'Jan 2024 - Present' }),
  tags: z.array(z.string()).default([]).meta({ help: 'Tech / category chips' }),
  actions: z.array(cardAction).default([]).meta({ help: 'Website, Source, Case study…' }),
});

export const schema = z.object({
  ...heading(),
  columns: z.enum(['2', '3']).default('2').meta({ help: 'Cards per row' }),
  items: z.array(project).default([]),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Projects',
    description: 'A gallery of project cards — the centerpiece of a portfolio.',
    category: 'portfolio',
    icon: 'tabler:layout-grid',
  },
  ui: {
    groups: [
      headingGroup,
      { key: 'grid', label: 'Grid', fields: ['columns', 'items'] },
    ],
  },
};
