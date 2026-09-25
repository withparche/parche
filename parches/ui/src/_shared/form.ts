/**
 * The content shapes of a form, shared by Contact and Newsletter: the fields
 * it asks for and what it says once sent. The Form element does the sending
 * (elements/src/form); these say what to render inside it.
 */
import { z } from 'zod';
import { action, link, text } from './content';

const option = z.union([z.string(), z.object({ value: z.string(), label: z.string(), description: z.string().optional(), disabled: z.boolean().default(false) })]);

/** One field. `type` picks the control; `options` feed a select or radio group. */
export const field = z.object({
  name: z.string(),
  label: z.string().optional().meta({ help: 'Defaults to the name, capitalised. A checkbox label may hold a link.' }),
  type: z.enum(['text', 'email', 'tel', 'url', 'number', 'date', 'textarea', 'select', 'radio', 'checkbox']).default('text'),
  placeholder: z.string().optional(),
  autocomplete: z.string().optional(),
  required: z.boolean().default(false),
  help: z.string().optional().meta({ help: 'A line under the control: why you ask, the format.' }),
  options: z.array(option).optional().meta({ help: 'For a select or radio: strings, or { value, label }.' }),
  rows: z.number().int().min(1).optional().meta({ help: 'For a textarea.' }),
});
export type Field = z.infer<typeof field>;

/** What the form shows once sent. */
export const success = z.object({
  label: z.string().optional().meta({ help: 'The submit button once sent: "Sent — reply within a day".' }),
  mode: z.enum(['button', 'append', 'replace']).default('append').meta({ help: 'button: only the label changes · append: the message under the form · replace: the message in place of the form.' }),
  title: text().optional(),
  text: text({ input: 'textarea' }).optional(),
  actions: z.array(action).default([]).meta({ help: 'What to do next: download, read the guide.' }),
  links: z.array(link).default([]).meta({ help: 'Small chips: "Add to Google", ".ics file".' }),
  copy: z.object({ label: z.string(), value: z.string(), copiedLabel: z.string().optional() }).optional().meta({ help: 'A value to copy: a referral link.' }),
});
export type Success = z.infer<typeof success>;

/** The sending side: labels and the failure message. */
export const sending = {
  endpoint: z.string().optional().meta({ help: 'Where the form posts. Without one the send is simulated, for demos.' }),
  loading: z.string().default('Sending…').meta({ help: 'The submit button while sending.' }),
  error: z.string().optional().meta({ help: 'Shown when the send fails; what was typed stays.' }),
  success: success.optional(),
};
