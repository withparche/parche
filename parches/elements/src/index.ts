import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { ParcheManifest } from '@parche/astro';

/**
 * The elements parche: foundational, token-driven building blocks every
 * widget composes from. Provides them as `parche:elements/*`.
 */
export default function createElements(): ParcheManifest {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const atom = (file: string) => path.resolve(dir, 'atoms', file);
  return {
    name: 'elements',
    // Let Tailwind scan these components' classes, even installed from npm.
    content: [path.resolve(dir, '**/*.astro')],
    elements: {
      Button: atom('Button.astro'),
      Container: atom('Container.astro'),
      Section: atom('Section.astro'),
      Icon: atom('Icon.astro'),
      Badge: atom('Badge.astro'),
      Eyebrow: atom('Eyebrow.astro'),
      Avatar: atom('Avatar.astro'),
      Divider: atom('Divider.astro'),
      Tag: atom('Tag.astro'),
      Link: atom('Link.astro'),
      Image: atom('Image.astro'),
    },
  };
}
