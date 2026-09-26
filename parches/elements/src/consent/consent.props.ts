import { z } from 'zod';
import { defineElement } from '@parche/elements/utils';

export const schema = z.object({
  text: z.string().meta({ help: 'What is asked and why, in one or two sentences. Inline HTML allowed (a link to the privacy page).' }),
  categories: z
    .array(z.object({ key: z.string().regex(/^[a-z][a-z0-9-]*$/), label: z.string(), description: z.string().optional() }))
    .min(1)
    .meta({ help: 'What can be switched on, besides what the site needs to work: ads, comments, analytics.' }),
  necessary: z.string().default('Necessary').meta({ help: 'The row that is always on.' }),
  accept: z.string().default('Accept all'),
  reject: z.string().default('Only necessary'),
  save: z.string().default('Save choices'),
  customize: z.string().default('Choose'),
  label: z.string().default('Cookie choices').meta({ help: 'The accessible name of the panel.' }),
});

export type Props = z.infer<typeof schema> & { class?: string };

export const meta = defineElement({
  element: {
    label: 'Consent',
    description: 'Asks once which categories the visitor accepts (ads, comments), remembers it, and lets anything that waits on it load. Reopened from any "Cookie preferences" link.',
    tokens: ['color-border', 'color-surface', 'color-heading', 'color-text', 'color-muted', 'color-primary'],
    tag: { name: 'parche-consent', entry: './consent.element.ts' },
    keyboard: {
      'Tab': 'Moves through the choices and the buttons.',
      'Escape': 'Closes the panel when reopened, keeping the recorded choice.',
    },
    noJs: 'Hidden: without script nothing that needs consent loads either.',
    parts: [
      { name: 'root', element: 'parche-consent', states: ['closed', 'open'] },
      { name: 'panel', element: 'section' },
      { name: 'choices', element: 'fieldset', description: 'Hidden until "Choose".' },
      { name: 'option', element: 'input' },
      { name: 'accept', element: 'button' },
      { name: 'reject', element: 'button' },
      { name: 'customize', element: 'button' },
      { name: 'save', element: 'button' },
    ],
  },
});
