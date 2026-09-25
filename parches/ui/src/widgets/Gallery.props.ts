import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { heading, headingGroup, image } from '../_shared/content';

export const schema = z.object({
  ...heading(),
  hint: z.string().optional().meta({ help: 'A line beside the heading: "← → to move · Esc to close".' }),
  items: z
    .array(
      z.object({
        image: image.optional().meta({ help: 'The thumbnail. Without one, a placeholder captioned with `placeholder`.' }),
        full: image.optional().meta({ help: 'The large image for the lightbox; defaults to the thumbnail.' }),
        caption: z.string().optional(),
        placeholder: z.string().optional().meta({ help: 'What the missing image is and its size: "work image · 2000×1250".' }),
        before: image.optional(),
        after: image.optional(),
      }),
    )
    .default([]),
  layout: z.enum(['grid', 'pairs']).default('grid').meta({ help: 'grid: thumbnails that open in a lightbox · pairs: before and after, side by side.' }),
  ratio: z.enum(['4/3', '16/10', '1/1', '4/5', '9/16']).default('4/3').meta({ help: '9/16 for phone screens.' }),
  lightbox: z.boolean().default(true),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Gallery',
    description: 'Captioned screens, work or photos that open in a lightbox; or before and after pairs.',
    category: 'media',
    icon: 'tabler:photo',
  },
  ui: {
    groups: [
      headingGroup,
      { key: 'content', label: 'Images', fields: ['items', 'hint'] },
      { key: 'layout', label: 'Layout', fields: ['layout', 'ratio', 'lightbox'] },
    ],
  },
};
