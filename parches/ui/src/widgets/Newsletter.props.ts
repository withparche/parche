import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { text } from '../_shared/content';
import { sending } from '../_shared/form';

export const schema = z.object({
  title: text().optional(),
  subtitle: text().optional().meta({ help: 'What arrives and how often: one promise, one frequency.' }),
  align: z.enum(['center', 'start']).default('center').meta({ help: 'Where an inline row sits: centred in a band, or at the start of a column.' }),
  layout: z.enum(['card', 'inline']).default('card').meta({ help: 'card: a titled card, for the end of a page or a post · inline: the field and the button in one centred row, for a hero or a closing band.' }),
  placeholder: z.string().default('you@company.com'),
  submit: z.string().default('Subscribe').meta({ help: 'The submit button label.' }),
  note: text().optional().meta({ help: 'Under the field: unsubscribe, how many readers, what you never do.' }),
  ...sending,
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Newsletter',
    description: 'One field, one promise, one line on what happens next: a subscribe card for the end of a page or a post.',
    category: 'forms',
    icon: 'tabler:mail',
  },
};
