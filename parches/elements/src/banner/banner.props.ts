import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  text: z.string().meta({ help: 'The message. Inline HTML allowed.' }),
  href: z.string().optional().meta({ help: 'Makes the message a link.' }),
  icon: z.string().optional().meta({ input: 'icon' }),
  aside: z.string().optional().meta({ help: 'Secondary text on the right, wide screens only. Inline HTML allowed.' }),
  dismissible: z.boolean().default(true),
  dismissLabel: z.string().default('Dismiss'),
  remember: z.string().optional().meta({ help: 'A key; once dismissed under it, the banner stays hidden on later visits.' }),
  tone: z.enum(['inverse', 'surface']).default('inverse'),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Banner',
    description: 'A slim message bar across the page, dismissible.',
    tokens: ['color-foreground', 'color-background', 'color-surface', 'color-heading', 'color-border', 'color-ring'],
    tag: { name: 'parche-banner', entry: './banner.element.ts' },
    keyboard: {
      'Tab': 'To the link and the dismiss button.',
      'Enter / Space': 'Dismisses (on the button).',
    },
    noJs: 'The bar shows and stays; the dismiss button does nothing without the element.',
    parts: [
      { name: 'root', element: 'parche-banner', states: ['open', 'closing'] },
      { name: 'dismiss', element: 'button' },
      { name: 'message', element: 'a | span' },
      { name: 'aside', element: 'span' },
    ],
  },
});
