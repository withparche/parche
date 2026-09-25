import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { action, image, heading, headingGroup } from '../_shared/content';

const item = z.object({
  title: z.string().optional(),
  description: z.string().optional().meta({ input: 'textarea' }),
  icon: z.string().optional().meta({ input: 'icon' }),
});

export const schema = z.object({
  ...heading({ align: 'center' }),
  content: z.string().optional().meta({ input: 'textarea', help: 'Rich text / HTML.' }),
  items: z.array(item).default([]),
  columns: z.enum(['1', '2', '3']).default('1').meta({ help: 'Columns for the items list.' }),
  reversed: z.boolean().default(false).meta({ help: 'Media on the left, text on the right.' }),
  actions: z.array(action).default([]).meta({ help: 'Under the text, before the checklist.' }),
  image: image.optional().meta({ help: 'Beside the text when the media slot is empty.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Content',
    description: 'Text and a checklist beside a media area that takes an image or anything else.',
    category: 'content',
    icon: 'tabler:layout-sidebar',
  },
  slots: {
    media: { label: 'Media', help: 'Beside the text, replacing the image: a screenshot, a video, a form, a code block.', max: 1 },
  },
  ui: {
    groups: [
      headingGroup,
      { key: 'body', label: 'Body', fields: ['content', 'items', 'actions'] },
      { key: 'layout', label: 'Layout', fields: ['columns', 'reversed', 'image'] },
    ],
  },
};
