import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { heading, headingGroup } from '../_shared/content';

export const schema = z.object({
  ...heading(),
  width: z.enum(['sm', 'md', 'lg']).default('lg'),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Heading',
    description: 'A section heading on its own: the eyebrow, the title and the lead over what follows in the band.',
    category: 'content',
    icon: 'tabler:heading',
  },
  ui: { groups: [headingGroup, { key: 'layout', label: 'Layout', fields: ['width'] }] },
};
