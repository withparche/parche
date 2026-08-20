import { z } from 'zod';
import type { WidgetMeta } from '@parche/core/types';

const ctaButton = z.object({
  variant: z.enum(['primary', 'secondary', 'tertiary', 'link']).default('primary'),
  text: z.string().optional(),
  href: z.string().optional().meta({ placeholder: 'https://...' }),
  icon: z.string().optional().meta({ input: 'icon' }),
});

export const schema = z.object({
  tagline: z.string().optional(),
  title: z.string().optional().meta({ help: 'Main hero heading (h1)' }),
  subtitle: z.string().optional().meta({ input: 'textarea' }),
  content: z.string().optional().meta({ input: 'textarea' }),
  callToAction: ctaButton.optional(),
  callToAction2: ctaButton.optional(),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Hero Text',
    description: 'Text-only hero with two CTA buttons',
    category: 'hero',
    icon: 'tabler:align-center',
  },
  ui: {
    groups: [
      { key: 'headline', label: 'Headline', fields: ['tagline', 'title', 'subtitle', 'content'] },
      { key: 'actions', label: 'Actions', fields: ['callToAction', 'callToAction2'] },
    ],
  },
};
