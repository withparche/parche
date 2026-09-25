import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { image, heading, headingGroup } from '../_shared/content';

const result = z.object({
  value: z.string().meta({ help: '"−71%", "9 d", "2.1×".' }),
  label: z.string().meta({ help: '"LCP", "To launch".' }),
  tone: z.enum(['default', 'success', 'warning']).default('default'),
});

const item = z.object({
  client: z.string(),
  sector: z.string().optional(),
  title: z.string(),
  description: z.string().optional().meta({ input: 'textarea' }),
  href: z.string().optional(),
  image: image.optional(),
  caption: z.string().optional().meta({ help: 'The placeholder caption until there is an image: "case shot · 900×560".' }),
  results: z.array(result).max(4).default([]).meta({ help: 'Three numbers with units and direction.' }),
});

export const schema = z.object({
  ...heading(),
  items: z.array(item).default([]),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Cases',
    description: 'Case studies as evidence: client and sector, what was done, and three measured results under each.',
    category: 'social-proof',
    icon: 'tabler:briefcase',
  },
  ui: {
    groups: [
      headingGroup,
      { key: 'content', label: 'Cases', fields: ['items'] },
    ],
  },
};
