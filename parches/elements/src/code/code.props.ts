import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  block: z.boolean().default(false).meta({ help: 'A multi-line block (<pre><code>) instead of inline code.' }),
  lang: z.string().optional().meta({ help: 'Language hint, exposed as data-lang and a class for highlighters.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Code',
    description: 'Inline code, or a plain code block.',
    tokens: ['color-surface', 'color-border', 'color-heading', 'color-text'],
    parts: [
      { name: 'root', element: 'code | pre' },
    ],
  },
});
