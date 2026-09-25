import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

const picture = z.object({ src: z.string(), alt: z.string().default('') });

export const schema = z.object({
  items: z
    .array(
      z.object({
        image: picture.optional().meta({ help: 'The thumbnail. Without one, a striped placeholder named by `placeholder`.' }),
        full: picture.optional().meta({ help: 'The large image the lightbox shows; defaults to the thumbnail.' }),
        caption: z.string().optional().meta({ help: 'Under the thumbnail and in the lightbox bar.' }),
        placeholder: z.string().optional().meta({ help: 'What the missing image is and its size: "work image · 2000×1250".' }),
        before: picture.optional().meta({ help: 'pairs: the left image.' }),
        after: picture.optional().meta({ help: 'pairs: the right image.' }),
      }),
    )
    .default([]),
  layout: z.enum(['grid', 'pairs']).default('grid').meta({ help: 'grid: thumbnails that open in a lightbox · pairs: a before and an after side by side, with a caption.' }),
  ratio: z.enum(['4/3', '16/10', '1/1', '4/5', '9/16']).default('4/3'),
  min: z.number().int().positive().optional().meta({ help: 'The narrowest a column may get, in pixels; defaults by ratio.' }),
  lightbox: z.boolean().default(true).meta({ help: 'Open a thumbnail larger, with previous, next and a counter.' }),
  label: z.string().default('Gallery').meta({ help: 'The lightbox\'s accessible name.' }),
  closeLabel: z.string().default('Close'),
  previousLabel: z.string().default('Previous'),
  nextLabel: z.string().default('Next'),
  countLabel: z.string().default('{n} of {total}').meta({ help: 'The counter; {n} and {total} are replaced.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Gallery',
    description: 'Captioned thumbnails that open in a lightbox with previous, next and a counter; or before and after pairs.',
    a11y: { pattern: 'dialog-modal', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/' },
    tokens: ['color-border', 'color-primary', 'color-muted', 'color-surface', 'color-surface-2', 'color-overlay', 'color-heading'],
    tag: { name: 'parche-gallery', entry: './gallery.element.ts' },
    keyboard: {
      'Enter / Space': 'On a thumbnail: opens it in the lightbox.',
      'ArrowRight / ArrowLeft': 'In the lightbox: the next or previous image, wrapping around.',
      Escape: 'Closes the lightbox; focus returns to the thumbnail that opened it.',
    },
    noJs: 'Each thumbnail is a link to its full-size image, so it opens in the browser; captions are always visible.',
    parts: [
      { name: 'root', element: 'parche-gallery' },
      { name: 'item', element: 'figure' },
      { name: 'trigger', element: 'a', description: 'The thumbnail, a link to the full image.' },
      { name: 'media', element: 'img', description: 'The thumbnail image, or its placeholder.' },
      { name: 'item-caption', element: 'figcaption' },
      { name: 'lightbox', element: 'dialog' },
      { name: 'stage', element: 'div', description: 'Where the open image is shown.' },
      { name: 'title', element: 'span', description: 'The open item\'s caption, in the bar.' },
      { name: 'count', element: 'span' },
      { name: 'previous', element: 'button' },
      { name: 'next', element: 'button' },
      { name: 'close', element: 'button' },
    ],
  },
});
