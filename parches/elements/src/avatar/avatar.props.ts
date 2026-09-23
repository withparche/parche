import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export const schema = z.object({
  src: z.string().optional().meta({ input: 'url', help: 'The picture. Without it, initials from `name` are shown.' }),
  name: z.string().optional().meta({ help: 'The person; used for the alt text and the initials fallback.' }),
  alt: z.string().optional().meta({ help: 'Overrides the alt text derived from `name`.' }),
  size: z.enum(sizes).default('md'),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Avatar',
    description: 'A person: their picture, or their initials when there is none.',
    tokens: ['color-surface', 'color-primary', 'color-primary-soft'],
    parts: [
      { name: 'root', element: 'img | span', description: 'The picture, or the initials disc.' },
    ],
  },
});
