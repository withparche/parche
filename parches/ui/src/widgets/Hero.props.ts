import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';
import { action, image, picture } from '../_shared/content';

export const layouts = ['center', 'split', 'text', 'side', 'overlay'] as const;

export const schema = z.object({
  layout: z.enum(layouts).default('center').meta({ help: 'center: copy above the media · split: copy left, media right · text: copy only · side: the heading on the left, the subtitle and actions on the right, for a page intro · overlay: the media across the page and the copy on a card over it, for a product.' }),
  align: z.enum(['center', 'start']).default('center').meta({ help: 'Where the copy sits in center and text layouts.' }),
  size: z.enum(['lg', 'md']).default('lg').meta({ help: 'lg for a home page, md for the title of an inner page.' }),
  tagline: z.string().optional().meta({ placeholder: 'e.g. FREE AND OPEN SOURCE' }),
  badge: z
    .object({
      text: z.string().meta({ help: 'The quiet part: "Free · MIT".' }),
      tag: z.string().optional().meta({ help: 'The accented part: "v1.0".' }),
      href: z.string().optional(),
    })
    .optional()
    .meta({ help: 'A pill above the heading, in place of the tagline: a licence, a version, a launch.' }),
  title: z.string().optional().meta({ help: 'The page heading (h1). Inline HTML allowed.' }),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  content: z.string().optional().meta({ input: 'textarea', help: 'Extra HTML under the subtitle.' }),
  points: z.array(z.string()).default([]).meta({ help: 'Short lines with a check mark under the subtitle: what you get, what it costs.' }),
  valign: z.enum(['center', 'start']).default('center').meta({ help: 'split: align the two columns on their middle or their top.' }),
  actions: z.array(action).default([]),
  note: z.string().optional().meta({ help: 'One quiet line under the actions: "Free for one project forever", the returns policy.' }),
  proofFirst: z.boolean().default(false).meta({ help: 'Put the proof slot (numbers, a call button) before the actions.' }),
  image: picture.optional().meta({ help: 'The media area when the media slot is empty: an image, a captioned placeholder until there is one, or either in a browser window or a phone.' }),
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
    media: { label: 'Media', help: 'Replaces the image: a screenshot, a form, a video, numbers under it. Stacked when several.', max: 3 },
    proof: { label: 'Proof', help: 'Under the actions: a command, stats, a logo wall, a quote.', max: 2 },
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['badge', 'tagline', 'title', 'subtitle', 'content'] },
      { key: 'actions', label: 'Actions', fields: ['actions'] },
      { key: 'layout', label: 'Layout', fields: ['layout', 'align', 'size', 'image'] },
    ],
  },
};
