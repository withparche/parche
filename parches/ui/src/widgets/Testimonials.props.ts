import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { action, verifiedQuote } from '../_shared/content';

const testimonial = verifiedQuote.extend({
  title: z.string().optional().meta({ help: 'A short headline above the quote.' }),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  testimonials: z.array(testimonial).default([]),
  layout: z.enum(['grid', 'carousel']).default('grid').meta({ help: 'A grid, or a carousel three per view.' }),
  callToAction: action.optional(),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Testimonials',
    description: 'Quotes that can be traced: name, role, date and a link to where each was said.',
    category: 'social-proof',
    icon: 'tabler:message-circle',
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle'] },
      { key: 'content', label: 'Testimonials', fields: ['testimonials'] },
      { key: 'layout', label: 'Layout', fields: ['layout'] },
      { key: 'actions', label: 'Actions', fields: ['callToAction'] },
    ],
  },
};
