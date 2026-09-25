import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { action, verifiedQuote, heading, headingGroup } from '../_shared/content';

const testimonial = verifiedQuote.extend({
  title: z.string().optional().meta({ help: 'A short headline above the quote.' }),
});

export const schema = z.object({
  ...heading({ align: 'center' }),
  items: z.array(testimonial).default([]),
  layout: z.enum(['grid', 'carousel']).default('grid').meta({ help: 'A grid, or a carousel three per view.' }),
  openSlot: z
    .object({
      label: z.string().meta({ help: '"Open slot · third quote".' }),
      text: z.string().meta({ input: 'textarea', help: 'What quote the slot is waiting for.' }),
      copy: z.object({ text: z.string().meta({ help: 'What the button copies: the request email.' }), label: z.string(), copiedLabel: z.string().optional() }).optional(),
    })
    .optional()
    .meta({ help: 'A visibly empty card, kept until a quote you can link to exists.' }),
  actions: z.array(action).default([]).meta({ help: 'Under the quotes: all reviews, the case studies.' }),
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
      headingGroup,
      { key: 'content', label: 'Testimonials', fields: ['items', 'openSlot'] },
      { key: 'layout', label: 'Layout', fields: ['layout'] },
      { key: 'actions', label: 'Actions', fields: ['actions'] },
    ],
  },
};
