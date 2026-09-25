import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  endpoint: z.string().optional().meta({ help: 'Where the form posts (Formspree, Netlify, your API). Without one, a demo: the send is simulated.' }),
  method: z.enum(['post', 'get']).default('post'),
  success: z.enum(['button', 'append', 'replace']).default('append').meta({ help: 'What success shows: only the button\'s label, the success content under the form, or the success content in place of the form.' }),
  loadingLabel: z.string().default('Sending…').meta({ help: 'The submit button while sending.' }),
  successLabel: z.string().optional().meta({ help: 'The submit button once sent: "Sent — reply within a day".' }),
  errorMessage: z.string().default('It did not send. What you wrote is still here; try again.').meta({ help: 'Shown when the send fails; the fields are never cleared.' }),
  label: z.string().optional().meta({ help: 'The form\'s accessible name.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Form',
    description: 'A real form that validates in place, shows sending, sent and failed, and keeps what was typed.',
    tokens: ['color-danger', 'color-danger-soft', 'color-muted'],
    tag: { name: 'parche-form', entry: './form.element.ts' },
    keyboard: {
      Enter: 'Submits from a single-line field, as a native form does.',
      'Tab': 'Moves through the fields; after a failed check, focus starts on the first invalid field.',
    },
    noJs: 'A native form: it posts to the endpoint and the browser checks required fields and types. Without an endpoint it does nothing harmful.',
    parts: [
      { name: 'root', element: 'parche-form', states: ['idle', 'loading', 'success', 'error'] },
      { name: 'form', element: 'form' },
      { name: 'error', element: 'div', description: 'The failure message, an alert.' },
      { name: 'success', element: 'div', description: 'The `success` slot, shown once sent.' },
      { name: 'status', element: 'span', description: 'Announces sending and sent.' },
    ],
  },
});
