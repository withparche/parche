import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { action, image } from '../_shared/content';

const item = z.object({
  title: z.string().optional(),
  description: z.string().optional().meta({ input: 'textarea' }),
  icon: z.string().optional().meta({ input: 'icon' }),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  content: z.string().optional().meta({ input: 'textarea', help: 'Rich text / HTML.' }),
  items: z.array(item).default([]),
  columns: z.enum(['1', '2', '3']).default('1').meta({ help: 'Columns for the items list.' }),
  reversed: z.boolean().default(false).meta({ help: 'Media on the left, text on the right.' }),
  callToAction: action.optional(),
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
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle'] },
      { key: 'body', label: 'Body', fields: ['content', 'items', 'callToAction'] },
      { key: 'layout', label: 'Layout', fields: ['columns', 'reversed', 'image'] },
    ],
  },
};
