import { z } from 'zod';
import type { WidgetMeta } from '@parche/core/types';

const faqItem = z.object({
  title: z.string().optional().meta({ label: 'Question' }),
  description: z.string().optional().meta({ label: 'Answer', input: 'textarea' }),
  icon: z.string().optional().meta({ input: 'icon' }),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  items: z.array(faqItem).default([]),
  columns: z.enum(['1', '2']).default('2').meta({ help: 'Number of columns' }),
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
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle'] },
      { key: 'content', label: 'Questions', fields: ['items'] },
      { key: 'layout', label: 'Layout', fields: ['columns'] },
    ],
  },
};
