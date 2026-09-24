import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { action, image } from '../_shared/content';

export const layouts = ['center', 'split', 'text'] as const;

export const schema = z.object({
  layout: z.enum(layouts).default('center').meta({ help: 'center: copy above the media · split: copy left, media right · text: copy only.' }),
  tagline: z.string().optional().meta({ placeholder: 'e.g. FREE AND OPEN SOURCE' }),
  title: z.string().optional().meta({ help: 'The page heading (h1). Inline HTML allowed.' }),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  content: z.string().optional().meta({ input: 'textarea', help: 'Extra HTML under the subtitle.' }),
  actions: z.array(action).default([]),
  image: image.optional().meta({ help: 'Shown in the media area when the media slot is empty.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Hero',
    description: 'The opening of a page: eyebrow, heading, subtitle, actions, and a media area that takes an image or anything else.',
    category: 'hero',
    icon: 'tabler:layout-rows',
    // Renders edge to edge and owns its padding: never wrapped as a page root.
    wrapper: false,
  },
  slots: {
    media: { label: 'Media', help: 'Replaces the image: a form, a video, a card, a code block.', max: 1 },
    proof: { label: 'Proof', help: 'Under the actions: stats, a logo wall, a quote.', max: 1 },
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle', 'content'] },
      { key: 'actions', label: 'Actions', fields: ['actions'] },
      { key: 'layout', label: 'Layout', fields: ['layout', 'image'] },
    ],
  },
};
