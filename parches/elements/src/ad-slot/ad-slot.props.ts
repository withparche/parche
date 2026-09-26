import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const sizes = ['leaderboard', 'rectangle', 'large-rectangle', 'half-page'] as const;

export const schema = z.object({
  size: z.enum(sizes).default('rectangle').meta({ help: 'leaderboard 728×90 (320×100 on phones) · rectangle 300×250 · large-rectangle 336×280 · half-page 300×600, sticky, wide screens only.' }),
  provider: z.enum(['adsense', 'script']).default('adsense').meta({ help: 'adsense: a Google AdSense unit · script: any network that works with a script and a container (EthicalAds, Carbon).' }),
  client: z.string().optional().meta({ help: 'AdSense: the publisher id, "ca-pub-…".' }),
  unit: z.string().optional().meta({ help: 'AdSense: the ad unit id.' }),
  src: z.string().optional().meta({ help: 'script: the network\'s script URL.' }),
  html: z.string().optional().meta({ help: 'script: the container the network fills, as HTML.' }),
  label: z.string().default('Advertisement'),
  consent: z.enum(['builtin', 'cmp']).default('builtin').meta({ help: 'builtin: waits for "ads" in the Consent element · cmp: a certified CMP gates the network itself (AdSense with TCF in the EEA, UK, Switzerland).' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Ad slot',
    description: 'A labelled place for an ad with its height reserved, so a late ad never moves the text; the network loads only after consent and when the slot is near.',
    tokens: ['color-border', 'color-surface', 'color-muted'],
    tag: { name: 'parche-ad', entry: './ad-slot.element.ts' },
    keyboard: { 'Tab': "Reaches the ad's own links once it has loaded; the slot adds no stop of its own." },
    noJs: 'The labelled, reserved space stays empty: no network loads without script.',
    parts: [
      { name: 'root', element: 'parche-ad', states: ['waiting', 'loaded'] },
      { name: 'label', element: 'p' },
      { name: 'box', element: 'div' },
    ],
  },
});
