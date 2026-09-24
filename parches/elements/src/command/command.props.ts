import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  command: z.string().meta({ help: 'The command, on one line.' }),
  prompt: z.string().default('$').meta({ help: 'The prompt before it; empty for none.' }),
  copyLabel: z.string().default('Copy'),
  copiedLabel: z.string().default('Copied').meta({ help: 'Shown on the button for a moment, and announced, after copying.' }),
  variant: z.enum(['line', 'button']).default('line').meta({ help: 'line: the command with a copy button · button: only the button, which copies the text without showing it (an email, a snippet).' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Command',
    description: 'A shell command on one line, with a button that copies it.',
    tokens: ['color-surface', 'color-surface-2', 'color-border', 'color-muted', 'color-primary', 'color-heading', 'color-ring'],
    tag: { name: 'parche-command', entry: './command.element.ts' },
    keyboard: {
      'Tab': 'To the copy button.',
      'Enter / Space': 'Copy the command; the button reads the copied label for a moment.',
    },
    noJs: 'The command is plain, selectable text. The copy button needs the clipboard and is hidden without script.',
    parts: [
      { name: 'root', element: 'parche-command' },
      { name: 'prompt', element: 'span' },
      { name: 'text', element: 'code', description: 'The command; truncated with an ellipsis when it does not fit.' },
      { name: 'copy', element: 'button' },
      { name: 'status', element: 'span', role: 'status', description: 'Announces the copied label.' },
    ],
  },
});
