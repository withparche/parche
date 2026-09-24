import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { image } from '../_shared/content';

const result = z.object({
  value: z.string().meta({ help: '"−71%", "9 d", "2.1×".' }),
  label: z.string().meta({ help: '"LCP", "To launch".' }),
  tone: z.enum(['default', 'success', 'warning']).default('default'),
});

const item = z.object({
  client: z.string(),
  sector: z.string().optional(),
  title: z.string(),
  summary: z.string().optional().meta({ input: 'textarea' }),
  href: z.string().optional(),
  image: image.optional(),
  caption: z.string().optional().meta({ help: 'The placeholder caption until there is an image: "case shot · 900×560".' }),
  results: z.array(result).max(4).default([]).meta({ help: 'Three numbers with units and direction.' }),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  link: z.object({ text: z.string(), href: z.string() }).optional().meta({ help: 'Where all the case studies are.' }),
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
};
