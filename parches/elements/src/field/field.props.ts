import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  id: z.string().meta({ help: 'The control\'s id. The description is `<id>-description` and the error `<id>-error`: point `aria-describedby` at them.' }),
  label: z.string().meta({ help: 'The control\'s name.' }),
  description: z.string().optional().meta({ help: 'Help text under the control.' }),
  error: z.string().optional().meta({ help: 'The validation message; shown in the danger colour.' }),
  required: z.boolean().default(false),
  hideLabel: z.boolean().default(false),
});

export type Props = z.infer<typeof schema> & { class?: string };


export const meta = defineElement({
  element: {
    label: 'Field',
    description: 'A form control with its label, help text and error, wired together.',
    tokens: ['color-heading', 'color-muted', 'color-danger'],
    parts: [
      { name: 'root', element: 'div', states: ['valid', 'invalid'] },
      { name: 'label', element: 'label' },
      { name: 'control', element: 'div', description: 'Holds the slotted control.' },
      { name: 'description', element: 'p' },
      { name: 'error', element: 'p' },
    ],
  },
});
