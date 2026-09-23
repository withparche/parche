import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { ParcheManifest } from '@parche/astro';

/**
 * The elements parche: foundational, token-driven building blocks every
 * widget composes from. Provides them as `parche:elements/*`.
 */
export default function createElements(): ParcheManifest {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const el = (file: string) => path.resolve(dir, file);
  return {
    name: 'elements',
    // Let Tailwind scan these components' classes, even installed from npm.
    content: [path.resolve(dir, '**/*.astro')],
    elements: {
      Button: el('button/Button.astro'),
      Container: el('container/Container.astro'),
      Section: el('section/Section.astro'),
      Icon: el('icon/Icon.astro'),
      Badge: el('badge/Badge.astro'),
      Eyebrow: el('eyebrow/Eyebrow.astro'),
      Avatar: el('avatar/Avatar.astro'),
      Divider: el('divider/Divider.astro'),
      Tag: el('tag/Tag.astro'),
      Link: el('link/Link.astro'),
      Image: el('image/Image.astro'),
      // Static tier, phase 1
      Heading: el('heading/Heading.astro'),
      Card: el('card/Card.astro'),
      Kbd: el('kbd/Kbd.astro'),
      Code: el('code/Code.astro'),
      Prose: el('prose/Prose.astro'),
      Video: el('video/Video.astro'),
      Skeleton: el('skeleton/Skeleton.astro'),
      Breadcrumb: el('breadcrumb/Breadcrumb.astro'),
      Pagination: el('pagination/Pagination.astro'),
      // Interactive tier A: platform-backed (details, dialog, popover, inputs)
      Collapsible: { entry: el('collapsible/Collapsible.astro'), style: el('collapsible/collapsible.css') },
      Accordion: el('accordion/Accordion.astro'),
      Switch: el('switch/Switch.astro'),
      Slider: el('slider/Slider.astro'),
      Dialog: { entry: el('dialog/Dialog.astro'), style: el('dialog/dialog.css') },
      Sheet: { entry: el('sheet/Sheet.astro'), style: el('sheet/sheet.css') },
      Popover: { entry: el('popover/Popover.astro'), style: el('popover/popover.css') },
      Tabs: { entry: el('tabs/Tabs.astro'), style: el('tabs/tabs.css') },
      Menu: el('menu/Menu.astro'),
      Tooltip: { entry: el('tooltip/Tooltip.astro'), style: el('tooltip/tooltip.css') },
      Toast: { entry: el('toast/Toast.astro'), style: el('toast/toast.css') },
      Carousel: {
        entry: el('carousel/index.ts'),
        parts: { Root: el('carousel/Root.astro'), Slide: el('carousel/Slide.astro') },
        props: el('carousel/carousel.props.ts'),
        style: el('carousel/carousel.css'),
      },
    },
  };
}
