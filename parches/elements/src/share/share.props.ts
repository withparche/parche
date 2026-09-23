import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const networks = ['x', 'facebook', 'linkedin', 'whatsapp', 'mail', 'copy'] as const;

export const schema = z.object({
  url: z.string(),
  title: z.string(),
  networks: z.array(z.enum(networks)).default([...networks]),
  label: z.string().default('Share').meta({ help: 'Leading text; also the accessible name of the group.' }),
  copiedText: z.string().default('Link copied'),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Share',
    description: 'Share a page: network links that work with no script, a copy-link button, and the device\'s own share sheet where it exists.',
    tokens: ['color-heading', 'color-muted', 'color-surface-hover', 'color-ring'],
    tag: { name: 'parche-share', entry: './share.element.ts' },
    keyboard: {
      'Tab': 'Through the buttons.',
      'Enter / Space': 'Share on that network, copy the link, or open the share sheet.',
    },
    noJs: 'The network buttons are links to the share intents, so they work as they are. Copy link and the native share sheet need the element (and are hidden without it).',
    parts: [
      { name: 'root', element: 'parche-share' },
      { name: 'label', element: 'span' },
      { name: 'item', element: 'a | button', description: 'One per network, `data-network`.' },
      { name: 'native', element: 'button', description: 'The device share sheet; shown only where `navigator.share` exists.' },
      { name: 'status', element: 'span', role: 'status', description: 'Announces "Link copied".' },
    ],
  },
});
