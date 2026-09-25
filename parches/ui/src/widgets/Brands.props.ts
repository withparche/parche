import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { image, heading, headingGroup } from '../_shared/content';

export const schema = z.object({
  ...heading({ align: 'center' }),
  icons: z.array(z.string()).default([]).meta({ help: 'Icon names (e.g. tabler:brand-github)' }),
  images: z.array(image).default([]),
  names: z
    .array(z.union([z.string(), z.object({ name: z.string(), note: z.string().optional().meta({ help: 'A second line: "Awwwards · 2025".' }), href: z.string().optional() })]))
    .default([])
    .meta({ help: 'Brands set as text, when there is no logo you may use; with a note, a recognition strip.' }),
  note: z.string().optional().meta({ help: 'A quiet fact at the end of the strip: "31 projects since 2019".' }),
  label: z.string().optional().meta({ help: 'The qualifier the strip starts with: "In production at".' }),
  layout: z.enum(['wrap', 'carousel', 'strip']).default('wrap').meta({ help: 'Wrapped rows, a carousel four per view, or one line: label, names, a note or a link.' }),
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
      headingGroup,
      { key: 'content', label: 'Brands', fields: ['icons', 'images', 'names', 'label'] },
      { key: 'layout', label: 'Layout', fields: ['layout'] },
    ],
  },
};
