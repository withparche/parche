import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const sizes = ['sm', 'md', 'lg'] as const;

export const schema = z.object({
  html: z.string().optional().meta({ input: 'textarea', help: 'Rendered HTML (e.g. from Markdown). Otherwise the slot is the content.' }),
  size: z.enum(sizes).default('md'),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Prose',
    description: 'Typography for long-form content: headings, lists, quotes, code, from the tokens.',
    tokens: ['color-heading', 'color-text', 'color-muted', 'color-primary', 'color-border', 'color-surface'],
    parts: [{ name: 'root', element: 'div' }],
  },
});
