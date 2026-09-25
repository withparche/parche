import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { action, image, verifiedQuote, heading, headingGroup, text } from '../_shared/content';

const testimonial = verifiedQuote.extend({
  title: z.string().optional().meta({ help: 'A short headline above the quote.' }),
  rating: z.number().min(0).max(5).optional().meta({ help: 'Stars out of five, for a review from a store or a map.' }),
  image: image.optional().meta({ help: 'A photo on top of the card: the customer\'s own photo of the product.' }),
  placeholder: z.string().optional().meta({ help: 'Until there is a photo: "customer photo".' }),
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
  avatars: z.boolean().default(true).meta({ help: 'Draw a round space for the portrait when a quote has none; off for store and map reviews.' }),
  note: text().optional().meta({ help: 'One line under the quotes: how they were collected, what is missing.' }),
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
