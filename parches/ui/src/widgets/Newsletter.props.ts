import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  title: z.string(),
  text: z.string().optional().meta({ help: 'What arrives and how often: one promise, one frequency.' }),
  action: z.string().optional().meta({ help: 'Where the form posts.' }),
  placeholder: z.string().default('you@company.com'),
  button: z.string().default('Subscribe'),
  note: z.string().optional().meta({ help: 'Under the field: unsubscribe, how many readers, what you never do.' }),
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
