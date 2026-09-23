import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const option = z.object({
  value: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

export const schema = z.object({
  name: z.string(),
  label: z.string(),
  options: z.array(option).min(1),
  value: z.string().optional().meta({ help: 'The selected option\'s value.' }),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  error: z.string().optional(),
  required: z.boolean().default(false),
  disabled: z.boolean().default(false),
  hideLabel: z.boolean().default(false),
  emptyText: z.string().default('No matches').meta({ help: 'Shown when nothing matches what was typed.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Combobox',
    description: 'A text input that filters a list of options as you type.',
    a11y: { pattern: 'combobox (list autocomplete)', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/' },
    tokens: ['color-surface', 'color-border', 'color-heading', 'color-muted', 'color-primary', 'color-ring', 'color-danger', 'color-surface-hover'],
    tag: { name: 'parche-combobox', entry: './combobox.element.ts' },
    keyboard: {
      'Type': 'Filters the options and opens the list.',
      'ArrowDown / ArrowUp': 'Move through the matching options (focus stays in the input).',
      'Enter': 'Picks the highlighted option.',
      'Escape': 'Closes the list.',
      'Alt+ArrowDown': 'Opens the list without filtering.',
    },
    noJs: 'A native `<datalist>` offers the same options as you type, and the typed text is what the form submits. The listbox, the `parche:select` event and the option values need the element.',
    parts: [
      { name: 'root', element: 'parche-combobox', states: ['open', 'closed'] },
      { name: 'wrapper', element: 'div' },
      { name: 'input', element: 'input', role: 'combobox' },
      { name: 'indicator', element: 'button', description: 'Opens the list; not in the tab order.' },
      { name: 'datalist', element: 'datalist', description: 'The no-script suggestions; detached on upgrade.' },
      { name: 'listbox', element: 'div', role: 'listbox' },
      { name: 'option', element: 'div', role: 'option', states: ['active', 'inactive'] },
      { name: 'empty', element: 'div' },
    ],
  },
});
