import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const ratios = ['1/1', '4/3', '16/9', '3/2', '21/9', '16/10', '1.91/1', '4/5', '3/4', '9/16'] as const;

/** A local image resolved by `resolveAssets` (astro:assets metadata) or a URL. */
const source = z.union([
  z.string().meta({ input: 'url' }),
  z.object({ src: z.string(), width: z.number(), height: z.number(), format: z.string().optional() }).passthrough(),
]);

export const schema = z.object({
  src: source.meta({ help: 'A URL, or `@/assets/…` resolved through resolveAssets before it gets here.' }),
  alt: z.string().meta({ help: 'Required. Use "" only for a purely decorative image.' }),
  width: z.number().default(800),
  height: z.number().optional(),
  ratio: z.enum(ratios).optional().meta({ help: 'Crops to a fixed aspect ratio (object-fit: cover).' }),
  loading: z.enum(['lazy', 'eager']).default('lazy').meta({ help: 'eager for an image above the fold; prefer `priority` for the main one.' }),
  priority: z.boolean().default(false).meta({ help: 'The page\'s main image (a hero, a post\'s cover): loaded at once, fetched first. One per page.' }),
  layout: z
    .enum(['constrained', 'full-width', 'fixed'])
    .optional()
    .meta({ help: 'How the srcset is chosen: constrained (up to `width`), full-width (the viewport), fixed. Default: parche({ images: { layout } }), else constrained.' }),
  sizes: z.string().optional().meta({ help: 'The sizes attribute, when the layout\'s default does not describe where the image sits.' }),
  fit: z.enum(['cover', 'contain']).default('cover'),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Image',
    description: 'An optimised, responsive image: local files through Astro, remote ones through their image CDN or Astro when allowed, as is otherwise.',
    tokens: ['color-surface'],
    parts: [
      { name: 'root', element: 'div', description: 'The frame; carries the aspect ratio.' },
      { name: 'img', element: 'img', description: 'The picture.' },
    ],
  },
});
