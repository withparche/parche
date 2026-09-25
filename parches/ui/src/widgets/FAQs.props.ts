import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { heading, headingGroup } from '../_shared/content';

const faqItem = z.object({
  title: z.string().optional().meta({ label: 'Question' }),
  description: z.string().optional().meta({ label: 'Answer', input: 'textarea', markdown: 'inline' }),
  icon: z.string().optional().meta({ input: 'icon' }),
});

export const schema = z.object({
  ...heading(),
  items: z.array(faqItem).default([]),
  columns: z.enum(['1', '2']).default('2').meta({ help: 'Number of columns' }),
  layout: z.enum(['accordion', 'list']).default('accordion').meta({ help: 'accordion: centred heading, chevrons · list: start-aligned heading, one column between hairlines, plus and minus, the first answer open.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'FAQs',
    description: 'Frequently asked questions grid',
    category: 'faq',
    icon: 'tabler:help-circle',
  },
  ui: {
    groups: [
      headingGroup,
      { key: 'content', label: 'Questions', fields: ['items'] },
      { key: 'layout', label: 'Layout', fields: ['columns'] },
    ],
  },
};
