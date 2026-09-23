import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const item = z.object({
  label: z.string(),
  href: z.string().optional().meta({ help: 'A link item. Otherwise a button that emits `parche:select`.' }),
  value: z.string().optional().meta({ help: 'Carried by `parche:select`; defaults to the label.' }),
  icon: z.string().optional().meta({ input: 'icon' }),
  description: z.string().optional(),
  disabled: z.boolean().default(false),
  checked: z.boolean().optional().meta({ help: 'Set (true or false) to make the item a radio-style choice, `menuitemradio`.' }),
  current: z.boolean().default(false).meta({ help: 'The item for the current page or state (`aria-current`).' }),
  hreflang: z.string().optional(),
});

export const group = z.object({
  title: z.string().optional(),
  items: z.array(item).min(1),
});

export const schema = z.object({
  id: z.string().meta({ help: 'The surface id; the trigger targets it with `popovertarget`.' }),
  label: z.string().optional().meta({ help: 'Trigger text. Otherwise fill the `trigger` slot with a button that has `popovertarget={id}`.' }),
  icon: z.string().optional().meta({ input: 'icon', help: 'Trigger icon.' }),
  triggerLabel: z.string().optional().meta({ help: 'Accessible name of an icon-only trigger.' }),
  variant: z.enum(['ghost', 'secondary']).default('ghost').meta({ help: 'Trigger look.' }),
  groups: z.array(group).min(1),
  placement: z.enum(['top', 'bottom']).default('bottom'),
  align: z.enum(['start', 'center', 'end']).default('start'),
  openOnHover: z.boolean().default(false).meta({ help: 'Also open on pointer hover (hover-capable devices only).' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Menu',
    description: 'A list of commands or links under a button: the APG menu button on the Popover API.',
    a11y: { pattern: 'menu button', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/' },
    tokens: ['color-surface', 'color-border', 'color-heading', 'color-muted', 'color-primary', 'color-surface-hover', 'color-ring'],
    tag: { name: 'parche-menu', entry: './menu.element.ts' },
    keyboard: {
      'Enter / Space / ArrowDown': 'Open from the trigger and focus the first item (ArrowUp: the last).',
      'ArrowDown / ArrowUp': 'Next / previous item, wrapping.',
      'Home / End': 'First / last item.',
      'A–Z': 'Focus the next item starting with that letter.',
      'Enter / Space': 'Activate the item.',
      'Escape': 'Close and return focus to the trigger.',
      'Tab': 'Close and move on.',
    },
    noJs: 'The trigger opens and closes the list (Popover API), items are plain links or buttons in the tab order. Arrow keys and typeahead need the element.',
    parts: [
      { name: 'root', element: 'parche-menu', states: ['open', 'closed'] },
      { name: 'trigger', element: 'button', description: 'Only when `label` or `icon` is given.' },
      { name: 'surface', element: 'div', role: 'menu' },
      { name: 'group', element: 'div', role: 'group' },
      { name: 'title', element: 'div' },
      { name: 'item', element: 'a | button', role: 'menuitem | menuitemradio' },
    ],
  },
});
