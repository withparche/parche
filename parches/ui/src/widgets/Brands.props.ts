import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { image } from '../_shared/content';

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  icons: z.array(z.string()).default([]).meta({ help: 'Icon names (e.g. tabler:brand-github)' }),
  images: z.array(image).default([]),
  names: z.array(z.string()).default([]).meta({ help: 'Brands set as text, when there is no logo you may use.' }),
  label: z.string().optional().meta({ help: 'The qualifier the strip starts with: "In production at".' }),
  link: z.object({ text: z.string(), href: z.string() }).optional().meta({ help: 'Where the full list is: "2,400+ sites shipped".' }),
  layout: z.enum(['wrap', 'carousel', 'strip']).default('wrap').meta({ help: 'Wrapped rows, a carousel four per view, or one line: label, names, link.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Brands',
    description: 'Who uses it: logos, icons or names, as rows, a carousel or a one-line strip with a qualifier and a link.',
    category: 'social-proof',
    icon: 'tabler:building',
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle'] },
      { key: 'content', label: 'Brands', fields: ['icons', 'images', 'names', 'label', 'link'] },
      { key: 'layout', label: 'Layout', fields: ['layout'] },
    ],
  },
};
