import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { heading, headingGroup, text } from '../_shared/content';
import { field, sending } from '../_shared/form';

export const schema = z.object({
  ...heading(),
  fields: z.array(field).default([]).meta({ help: 'What the form asks, in order: text, email, select, textarea, checkbox…' }),
  submit: z.string().default('Send message').meta({ help: 'The submit button label.' }),
  note: text().optional().meta({ help: 'One line under the button.' }),
  ...sending,
  layout: z.enum(['centered', 'split', 'plain']).default('centered').meta({ help: 'centered: the form on a card under the heading · split: the heading and the booking card on the left, the form on a card on the right · plain: the heading and the form with no card, for a column beside other content.' }),
  booking: z
    .object({
      title: z.string().default('Next available'),
      badge: z.string().optional().meta({ help: '"3 slots left".' }),
      slots: z.array(z.object({ label: z.string(), href: z.string().optional(), selected: z.boolean().default(false) })).default([]),
      note: z.string().optional().meta({ help: '"Times in your local zone · 25 min".' }),
    })
    .optional()
    .meta({ help: 'Bookable slots beside the form, each a link to the booking page.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Contact',
    description: 'A form that says what happens next: fields from content, sending and sent states, and optional bookable slots beside it.',
    category: 'contact',
    icon: 'tabler:mail',
  },
  ui: {
    groups: [
      headingGroup,
      { key: 'form', label: 'Form', fields: ['fields', 'submit', 'note'] },
      { key: 'sending', label: 'Sending', fields: ['endpoint', 'loading', 'error', 'success'] },
    ],
  },
};
