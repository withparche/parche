import { z } from 'zod';
import type { WidgetMeta } from '@parche/core/types';

const testimonial = z.object({
  title: z.string().optional(),
  testimonial: z.string().optional().meta({ input: 'textarea' }),
  name: z.string().optional(),
  job: z.string().optional(),
  image: z.object({ src: z.string().optional(), alt: z.string().optional() }).optional(),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  testimonials: z.array(testimonial).default([]),
  callToAction: z.object({
    text: z.string().optional(),
    href: z.string().optional().meta({ placeholder: 'https://...' }),
  }).optional(),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Testimonials',
    description: 'Customer testimonials grid with avatars',
    category: 'social-proof',
    icon: 'tabler:message-circle',
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle'] },
      { key: 'content', label: 'Testimonials', fields: ['testimonials'] },
      { key: 'actions', label: 'Actions', fields: ['callToAction'] },
    ],
  },
};
