/**
 * The widgets the landing pages asked for: a sticky call to action, a
 * countdown, a before-and-after frame and a calculator. Each reads right
 * before any script runs.
 */
import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import StickyBar from '../../src/widgets/StickyBar.astro';
import Countdown from '../../src/widgets/Countdown.astro';
import Compare from '../../src/widgets/Compare.astro';
import Calculator from '../../src/widgets/Calculator.astro';

let container: AstroContainer | null = null;
async function render(Widget: any, props: Record<string, unknown>) {
  container ??= await AstroContainer.create();
  return container.renderToString(Widget, { props });
}

test('StickyBar renders its text and action, hidden and inert until shown', async () => {
  const html = await render(StickyBar, { text: 'The template is free', action: { text: 'Get it', href: '#get' } });
  expect(html).toContain('<parche-sticky-bar');
  expect(html).toContain('The template is free');
  expect(html).toContain('href="#get"');
  expect(html).toMatch(/\sinert/);
});

test('Countdown always shows the date in words and carries the moment', async () => {
  const html = await render(Countdown, { to: '2026-12-01T09:00:00Z', date: '1 December 2026 · 09:00 UTC' });
  expect(html).toContain('<parche-countdown');
  expect(html).toContain('1 December 2026 · 09:00 UTC');
  expect(html).toContain('2026-12-01T09:00:00Z');
});

test('Compare renders both sides with their labels and a labelled range', async () => {
  const html = await render(Compare, {
    title: 'Same page, rebuilt',
    before: { label: 'before · 3.1 s', placeholder: 'old page' },
    after: { label: 'after · 0.4 s', tone: 'success', placeholder: 'new page' },
  });
  expect(html).toContain('<parche-compare');
  expect(html).toContain('before · 3.1 s');
  expect(html).toContain('after · 0.4 s');
  expect(html).toMatch(/type="range"[^>]*aria-label="Drag to compare"|aria-label="Drag to compare"[^>]*type="range"/);
});

test('Calculator computes the first result on the server', async () => {
  const html = await render(Calculator, {
    label: 'What it costs you',
    inputs: [
      { name: 'calls', label: 'Calls per month', value: 40, step: 5 },
      { name: 'hours', label: 'Hours each', value: 1.5, step: 0.5 },
    ],
    results: [{ label: 'Given back', formula: 'calls * hours * 0.5', suffix: ' hours / month', note: 'Half of the first calls.' }],
    share: { note: 'Send it to whoever approves the budget.' },
  });
  expect(html).toContain('<parche-calculator');
  expect(html).toContain('30 hours / month');
  expect(html).toContain('Half of the first calls.');
  expect(html).toContain('What it costs you');
  expect(html).toMatch(/<label[^>]*for="calc-calls"/);
});

test('Calculator rejects a formula that names something it does not have', async () => {
  await expect(
    render(Calculator, { inputs: [{ name: 'a', label: 'A', value: 1 }], results: [{ label: 'x', formula: 'a * window' }] }),
  ).rejects.toThrow(/Unknown name "window"/);
});
