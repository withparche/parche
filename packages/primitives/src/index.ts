import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * Parche primitives: the foundational, token-driven building blocks every
 * widget composes from. Consumed by core and widgets via `parche:primitives/*`.
 * Returns a map of name → absolute component path.
 */
export default function createPrimitives(): Record<string, string> {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const atom = (file: string) => path.resolve(dir, 'atoms', file);
  return {
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
  };
}
