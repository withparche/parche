import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  text: z.string().default('We use cookies for the things below only if you agree. The site works without them.').meta({ help: 'What is asked and why. Inline HTML allowed: a link to the privacy page.' }),
  categories: z
    .array(z.object({ key: z.string(), label: z.string(), description: z.string().optional() }))
    .min(1)
    .meta({ help: 'What can be switched on. The keys are what waits on it: "ads" for AdSlot, "comments" for Comments.' }),
  necessary: z.string().default('Necessary'),
  accept: z.string().default('Accept all'),
  reject: z.string().default('Only necessary'),
  save: z.string().default('Save choices'),
  customize: z.string().default('Choose'),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Cookie consent',
    description: 'Asks once which optional categories the visitor accepts (ads, comments), and lets them load only then. Place it in the layout; a link to #cookie-preferences reopens it.',
    category: 'layout',
    icon: 'tabler:cookie',
    // Fixed at the foot of the screen: never wrapped in a section.
    wrapper: false,
  },
};
