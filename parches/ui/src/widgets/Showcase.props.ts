import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { image } from '../_shared/content';

const demo = z.object({
  value: z.string().meta({ help: 'Identifies the demo in the URL: "saas".' }),
  label: z.string().meta({ help: 'The segment: "SaaS".' }),
  title: z.string(),
  body: z.string().meta({ input: 'textarea' }),
  points: z.array(z.string()).default([]).meta({ help: 'Three things specific to this demo.' }),
  image: image.optional().meta({ help: 'The demo\'s screenshot. Without one, a placeholder with the caption.' }),
  caption: z.string().optional().meta({ help: '"saas demo · 1000×625".' }),
  link: z.object({ text: z.string(), href: z.string() }).optional(),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  demos: z.array(demo).min(1),
  syncKey: z.string().optional().meta({ help: 'Keep the chosen demo in the URL under this key.' }),
  label: z.string().default('Demos').meta({ help: 'Accessible name of the switcher.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Showcase',
    description: 'One control, several real sites: a segmented switcher beside the heading, and for each a screenshot, what it is, three specifics and a link.',
    category: 'media',
    icon: 'tabler:device-desktop',
  },
};
