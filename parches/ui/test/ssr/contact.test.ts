/**
 * Contact: fields from content through the Form element, and what it shows
 * once sent.
 */
import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Contact from '../../src/widgets/Contact.astro';
import Newsletter from '../../src/widgets/Newsletter.astro';

let container: AstroContainer | null = null;
async function render(Widget: any, props: Record<string, unknown>) {
  container ??= await AstroContainer.create();
  return container.renderToString(Widget, { props });
}

test('each field type renders its control, and the form is the Form element', async () => {
  const html = await render(Contact, {
    title: 'Talk to us',
    fields: [
      { name: 'topic', type: 'select', label: 'What is this about?', options: ['Something is broken', 'Press'], required: true },
      { name: 'email', type: 'email', required: true, help: 'We only use it to reply.' },
      { name: 'message', type: 'textarea', rows: 3 },
      { name: 'consent', type: 'checkbox', label: 'I agree' },
    ],
    submit: 'Send it',
  });
  expect(html).toContain('<parche-form');
  expect(html).toMatch(/<select[^>]+name="topic"[^>]*required/);
  expect(html).toContain('Something is broken');
  expect(html).toMatch(/<input[^>]+type="email"[^>]+name="email"|<input[^>]+name="email"[^>]+type="email"/);
  expect(html).toContain('We only use it to reply.');
  expect(html).toMatch(/<textarea[^>]+name="message"/);
  expect(html).toMatch(/type="checkbox"[^>]*name="consent"|name="consent"[^>]*type="checkbox"/);
  expect(html).toContain('Send it');
});

test('success content is rendered hidden, with its mode and label for the element', async () => {
  const html = await render(Contact, {
    fields: [{ name: 'email', type: 'email' }],
    success: { label: 'Sent ✓', mode: 'replace', title: 'It is in your inbox', actions: [{ text: 'Get the template', href: '/get' }] },
  });
  expect(html).toContain('data-success="replace"');
  expect(html).toContain('success-label="Sent ✓"');
  expect(html).toMatch(/data-part="success"[^>]*hidden/);
  expect(html).toContain('It is in your inbox');
  expect(html).toContain('href="/get"');
  // No endpoint: a demo form that simulates the send.
  expect(html).toContain('data-demo');
});

test('newsletter inline is one row with its own error line, and two on a page do not share an id', async () => {
  const a = await render(Newsletter, { layout: 'inline', submit: 'Notify me' });
  const b = await render(Newsletter, { layout: 'inline', submit: 'Start free' });
  const id = (html: string) => html.match(/<input[^>]+id="([^"]+)"/)?.[1];
  expect(id(a)).not.toBe(id(b));
  expect(a).toContain(`id="${id(a)}-error"`);
  expect(a).toContain('max-w-[460px]');
});
