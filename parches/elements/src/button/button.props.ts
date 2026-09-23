import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const variants = ['primary', 'secondary', 'ghost', 'link'] as const;
export const sizes = ['sm', 'md', 'lg'] as const;
export const tones = ['default', 'danger'] as const;

export const schema = z.object({
  variant: z.enum(variants).default('primary').meta({ help: 'Visual weight: primary for the main action, secondary beside it, ghost for low emphasis, link for inline.' }),
  size: z.enum(sizes).default('md'),
  tone: z.enum(tones).default('default').meta({ help: 'danger for destructive actions.' }),
  href: z.string().optional().meta({ input: 'url', help: 'Renders a link instead of a button.' }),
  target: z.string().optional().meta({ help: '_blank adds rel="noopener noreferrer".' }),
  type: z.enum(['button', 'submit', 'reset']).default('button').meta({ help: 'Only for buttons (no href).' }),
  disabled: z.boolean().default(false),
  icon: z.string().optional().meta({ input: 'icon' }),
  iconPosition: z.enum(['start', 'end']).default('start'),
  block: z.boolean().default(false).meta({ help: 'Full width of its container.' }),
  label: z.string().optional().meta({ help: 'Accessible name — required when the button shows only an icon.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Button',
    description: 'The action element: a button, or a link that looks like one.',
    a11y: { pattern: 'button', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/' },
    tokens: ['color-primary', 'color-on-primary', 'color-surface', 'color-surface-hover', 'color-heading', 'color-muted', 'color-border', 'color-ring', 'color-danger', 'color-on-danger', 'color-danger-soft'],
    parts: [{ name: 'root', element: 'button | a', description: 'The button itself; an <a> when href is set.', states: ['disabled'] }],
  },
  ui: {
    groups: [
      { key: 'look', label: 'Look', fields: ['variant', 'size', 'tone', 'block'] },
      { key: 'behaviour', label: 'Behaviour', fields: ['href', 'target', 'type', 'disabled'] },
      { key: 'icon', label: 'Icon', fields: ['icon', 'iconPosition', 'label'] },
    ],
  },
});
