import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const tones = ['neutral', 'success', 'warning', 'danger'] as const;

export const item = z.object({
  title: z.string(),
  description: z.string().optional(),
  tone: z.enum(tones).default('neutral'),
});

export const schema = z.object({
  position: z.enum(['top-right', 'top-center', 'bottom-right', 'bottom-center']).default('bottom-right'),
  label: z.string().default('Notifications').meta({ help: 'Accessible name of the region.' }),
  duration: z.number().int().min(0).default(5000).meta({ help: 'Milliseconds before a toast dismisses itself; 0 keeps it until dismissed.' }),
  dismissLabel: z.string().default('Dismiss'),
  items: z.array(item).default([]).meta({ help: 'Toasts present on first render, e.g. a message after a form submission.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Toast',
    description: 'Brief notifications in a live region, shown from script or rendered on the page.',
    a11y: { pattern: 'alert / status', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/alert/' },
    tokens: ['color-surface', 'color-border', 'color-heading', 'color-muted', 'color-ring', 'color-surface-hover', 'color-success', 'color-warning', 'color-danger'],
    tag: { name: 'parche-toaster', entry: './toast.element.ts' },
    keyboard: {
      'Tab': 'Reaches the dismiss button of each toast.',
      'Enter / Space': 'Dismisses (on the button).',
    },
    noJs: 'Toasts rendered on the server (`items`) show and stay; their dismiss buttons do nothing. Toasts from script need the element, by definition.',
    parts: [
      { name: 'root', element: 'parche-toaster' },
      { name: 'region', element: 'div', role: 'status', description: 'The live region; additions are announced.' },
      { name: 'list', element: 'ol' },
      { name: 'toast', element: 'li', states: ['open', 'closing'] },
      { name: 'icon', element: 'span' },
      { name: 'title', element: 'p' },
      { name: 'description', element: 'p' },
      { name: 'dismiss', element: 'button' },
      { name: 'template', element: 'template', description: 'What `show()` clones.' },
    ],
  },
});
