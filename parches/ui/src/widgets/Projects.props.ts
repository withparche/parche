import { z } from 'zod';
import type { WidgetMeta } from '@parche/core/types';

const link = z.object({
  label: z.string().optional().meta({ placeholder: 'Website' }),
  href: z.string().optional().meta({ placeholder: 'https://…' }),
  icon: z.string().optional().meta({ input: 'icon', placeholder: 'tabler:external-link' }),
});

const project = z.object({
  title: z.string().optional(),
  description: z.string().optional().meta({ input: 'textarea' }),
  image: z.object({ src: z.string().optional(), alt: z.string().optional() }).optional(),
  date: z.string().optional().meta({ placeholder: 'Jan 2024 - Present' }),
  tags: z.array(z.string()).default([]).meta({ help: 'Tech / category chips' }),
  links: z.array(link).default([]).meta({ help: 'Website, Source, Case study…' }),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  columns: z.enum(['2', '3']).default('2').meta({ help: 'Cards per row' }),
  projects: z.array(project).default([]),
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
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle'] },
      { key: 'grid', label: 'Grid', fields: ['columns', 'projects'] },
    ],
  },
};
