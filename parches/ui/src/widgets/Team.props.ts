import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { image, heading, headingGroup } from '../_shared/content';

const member = z.object({
  name: z.string(),
  role: z.string().meta({ help: 'Role and one checkable credential: "Creator · 2,100 commits".' }),
  image: image.optional().meta({ help: 'A portrait. Without one, a striped square named after the person.' }),
  href: z.string().optional().meta({ help: 'A public profile.' }),
});

export const schema = z.object({
  ...heading(),
  items: z.array(member).default([]),
  more: z
    .object({ count: z.string().meta({ help: '"+180".' }), label: z.string(), note: z.string().optional() })
    .optional()
    .meta({ help: 'A last tile for everyone not listed: contributors since a date.' }),
  layout: z.enum(['split', 'stacked']).default('split').meta({ help: 'split: the heading beside the grid · stacked: the heading above it.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Team',
    description: 'Named people with a checkable credential each, and a tile for everyone else.',
    category: 'about',
    icon: 'tabler:users',
  },
  ui: {
    groups: [
      headingGroup,
      { key: 'content', label: 'People', fields: ['items', 'more'] },
      { key: 'layout', label: 'Layout', fields: ['layout'] },
    ],
  },
};
