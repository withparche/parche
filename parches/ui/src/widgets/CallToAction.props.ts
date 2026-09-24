import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { action } from '../_shared/content';

export const layouts = ['card', 'band', 'inline', 'closing'] as const;

export const schema = z.object({
  layout: z.enum(layouts).default('card').meta({ help: 'card: a bordered panel · band: headline left and button right · inline: one line, for the middle of a page · closing: a large centred close, with a slot below the actions.' }),
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  actions: z.array(action).default([]),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Call to Action',
    description: 'One headline and one action, as a panel, a band or a single line. Put it in a toned Section for the dark closing band.',
    category: 'call-to-action',
    icon: 'tabler:click',
  },
  slots: {
    below: { label: 'Below', help: 'Under the actions of a closing call to action: a newsletter, a command.', max: 1 },
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle'] },
      { key: 'actions', label: 'Actions', fields: ['actions'] },
      { key: 'layout', label: 'Layout', fields: ['layout'] },
    ],
  },
};
