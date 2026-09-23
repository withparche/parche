import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  count: z.number().int().min(1).meta({ help: 'How many slides follow; renders the slide picker.' }),
  label: z.string().meta({ help: 'Accessible name of the carousel, e.g. "Testimonials".' }),
  perView: z.number().int().min(1).max(4).default(1).meta({ help: 'Slides visible at once on wide screens; always one on narrow ones.' }),
  controls: z.boolean().default(true).meta({ help: 'Previous / next buttons.' }),
  dots: z.boolean().default(true).meta({ help: 'One button per slide.' }),
  prevLabel: z.string().default('Previous slide'),
  nextLabel: z.string().default('Next slide'),
});

export const parts = {
  Slide: {
    schema: z.object({
      index: z.number().int().min(0).meta({ help: 'Zero-based position.' }),
      total: z.number().int().min(1),
      label: z.string().optional().meta({ help: 'Accessible name; "n of N" when omitted.' }),
    }),
  },
};

export type Props = z.infer<typeof schema> & { class?: string };
export type SlideProps = z.infer<typeof parts.Slide.schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Carousel',
    description: 'Slides in a scroll-snap track with previous / next controls and a slide picker.',
    a11y: { pattern: 'carousel', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/carousel/' },
    tokens: ['color-surface', 'color-border', 'color-heading', 'color-muted', 'color-primary', 'color-ring', 'color-surface-hover'],
    tag: { name: 'parche-carousel', entry: './carousel.element.ts' },
    keyboard: {
      'ArrowRight / ArrowLeft': 'Next / previous slide (on the track).',
      'Home / End': 'First / last slide.',
      'Tab': 'Track, then the controls and the slide picker.',
    },
    noJs: 'The track scrolls natively and snaps to each slide, by touch, wheel or keyboard. The buttons and the slide picker are hidden.',
    parts: [
      { name: 'root', element: 'parche-carousel', role: 'region' },
      { name: 'track', element: 'div', role: 'group', description: 'The scroll-snap container.' },
      { name: 'slide', element: 'div', role: 'group', states: ['active', 'inactive'] },
      { name: 'controls', element: 'div' },
      { name: 'prev', element: 'button' },
      { name: 'next', element: 'button' },
      { name: 'dots', element: 'div', role: 'group' },
      { name: 'dot', element: 'button' },
    ],
  },
});
