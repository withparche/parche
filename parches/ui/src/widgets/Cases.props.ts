import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { image, heading, headingGroup, text } from '../_shared/content';

const result = z.object({
  value: z.string().meta({ help: '"−71%", "9 d", "2.1×".' }),
  label: z.string().meta({ help: '"LCP", "To launch".' }),
  tone: z.enum(['default', 'success', 'warning']).default('default'),
});

const item = z.object({
  client: z.string(),
  sector: z.string().optional(),
  title: z.string(),
  description: z.string().optional().meta({ input: 'textarea', markdown: 'inline' }),
  href: z.string().optional(),
  image: image.optional(),
  caption: z.string().optional().meta({ help: 'The placeholder caption until there is an image: "case shot · 900×560".' }),
  results: z.array(result).max(4).default([]).meta({ help: 'Three numbers with units and direction.' }),
  footer: text().optional().meta({ help: 'A quiet fact under the case: "11 weeks · rebrand and website".' }),
  quote: z.object({ text: text({ input: 'textarea' }), name: z.string(), role: z.string().optional() }).optional().meta({ help: 'What the client said, with who said it.' }),
  featured: z.boolean().default(false).meta({ help: 'The case to lead with: full width, a wide image, the results and the quote beside the text.' }),
});

export const schema = z.object({
  ...heading(),
  items: z.array(item).default([]),
  layout: z.enum(['cards', 'rows']).default('cards').meta({ help: 'cards: a grid of cards, the image on top · rows: one case per row, the image beside the text.' }),
  results: z.enum(['bottom', 'top']).default('bottom').meta({ help: 'top: lead each case with its headline number, above the client.' }),
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
