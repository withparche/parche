import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  layout: z
    .enum(['band', 'hero', 'field'])
    .default('band')
    .meta({ help: "band: title and text beside the form, after a list · hero: a subscribe page's opening · field: only the form, under a heading that already says it all." }),
  eyebrow: z.string().optional().meta({ help: 'The cadence, over the title: "Every Tuesday, 8:00 CET".' }),
  title: z.string().optional().meta({ help: 'Default: "Get new posts by email".' }),
  text: z.string().optional().meta({ help: 'What arrives and how often: one promise, one frequency.' }),
  note: z.string().optional().meta({ help: 'Under the field: how many readers, the unsubscribe promise. Default: one-click unsubscribe.' }),
  button: z.string().optional(),
  points: z.array(z.string()).default([]).meta({ help: 'What a subscriber gets, one line each, under the form on a hero.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Subscribe',
    description: "The blog's subscription form: a band after a list, a subscribe page's opening, or the field alone. Nothing when the blog has no subscription.",
    category: 'blog',
    icon: 'tabler:mail',
  },
};
