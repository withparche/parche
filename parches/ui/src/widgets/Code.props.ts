import { z } from 'zod';
import type { WidgetMeta } from '@parche/astro/types';

export const schema = z.object({
  code: z.string().optional().meta({ input: 'textarea', help: 'One block of code, when there is a single way to write it.' }),
  tabs: z
    .array(z.object({ label: z.string(), code: z.string().meta({ input: 'textarea' }) }))
    .max(6)
    .default([])
    .meta({ help: 'The same step for several tools: npm, pnpm, brew. The reader picks one.' }),
  lang: z.string().optional().meta({ help: 'A language hint for highlighters: bash, json, ts.' }),
  copyLabel: z.string().default('Copy'),
  copiedLabel: z.string().default('Copied'),
  syncKey: z.string().optional().meta({ help: 'Remember the chosen tab across the page (and in the URL) under this key.' }),
});

export type Props = z.infer<typeof schema>;

export const meta: WidgetMeta = {
  widget: {
    label: 'Code',
    description: 'A code block with a copy button, or the same step for several tools in tabs.',
    category: 'content',
    icon: 'tabler:code',
  },
};
