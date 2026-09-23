import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  for: z.string().meta({ help: 'The id of the control it names.' }),
  text: z.string().optional().meta({ help: 'The label. Otherwise slot it.' }),
  required: z.boolean().default(false).meta({ help: 'Shows the required mark.' }),
  hidden: z.boolean().default(false).meta({ help: 'Visually hidden, still read: for a control whose purpose is obvious on sight.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Label',
    description: 'The name of a form control.',
    tokens: ['color-heading', 'color-danger'],
    parts: [
      { name: 'root', element: 'label' },
      { name: 'required', element: 'span', description: 'The mark; decorative, the control carries `required`.' },
    ],
  },
});
