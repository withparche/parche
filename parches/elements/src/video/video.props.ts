import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const ratios = ['16/9', '4/3', '1/1', '21/9'] as const;

export const schema = z.object({
  src: z.string().meta({ input: 'url', help: 'A YouTube or Vimeo page URL, or a video file URL.' }),
  title: z.string().meta({ help: 'Required: the accessible name of the player.' }),
  poster: z.string().optional().meta({ input: 'url', help: 'Still image shown before a file video plays.' }),
  ratio: z.enum(ratios).default('16/9'),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Video',
    description: 'An embedded YouTube or Vimeo player, or a native video file.',
    tokens: ['color-surface'],
    parts: [
      { name: 'root', element: 'div', description: 'The frame with the aspect ratio.' },
      { name: 'player', element: 'iframe | video' },
    ],
  },
});
