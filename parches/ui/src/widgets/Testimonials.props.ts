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
  align: z.enum(['center', 'start']).default('center').meta({ help: 'Where the heading sits.' }),
  openSlot: z
    .object({
      label: z.string().meta({ help: '"Open slot · third quote".' }),
      text: z.string().meta({ input: 'textarea', help: 'What quote the slot is waiting for.' }),
      copy: z.object({ text: z.string().meta({ help: 'What the button copies: the request email.' }), label: z.string(), copiedLabel: z.string().optional() }).optional(),
    })
    .optional()
    .meta({ help: 'A visibly empty card, kept until a quote you can link to exists.' }),
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
