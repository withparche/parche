/**
 * Stats on sourced numbers and Testimonials on verified quotes: every number
 * says where it comes from, every quote says who said it and where.
 */
import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Stats from '../../src/widgets/Stats.astro';
import Testimonials from '../../src/widgets/Testimonials.astro';

let container: AstroContainer | null = null;
async function render(Component: any, props: Record<string, unknown>) {
  container ??= await AstroContainer.create();
  return container.renderToString(Component, { props });
}

test('Stats shows value and unit, and the source and date under each number, linked when there is a report', async () => {
  const html = await render(Stats, {
    title: 'Core Web Vitals',
    stats: [
      { value: '0.9', unit: 's', label: 'LCP', source: 'p75 · 41,200 sessions', date: '28 days', href: 'https://example.com/crux' },
      { value: '42', unit: 'ms', label: 'INP' },
    ],
  });
  expect(html).toContain('0.9');
  expect(html).toContain('LCP');
  expect(html).toMatch(/p75 · 41,200 sessions[\s\S]*28 days/);
  expect(html).toContain('href="https://example.com/crux"');
  expect(html).toContain('INP');
  // Fits whatever width it is given: four in a band, two by two in half a column.
  expect(html).toContain('grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]');
});

test('Testimonials carries name, role, date and a link to where the quote was said', async () => {
  const html = await render(Testimonials, {
    title: 'Every quote links to where it was said',
    testimonials: [
      { text: 'Bounce went down 64% the week after launch.', name: 'Marta Ruiz', role: 'Head of Growth, Formular', date: 'March 2026', source: 'G2 review', href: 'https://example.com/review' },
    ],
  });
  expect(html).toContain('Bounce went down 64%');
  expect(html).toContain('Marta Ruiz');
  expect(html).toContain('Head of Growth');
  expect(html).toContain('March 2026');
  expect(html).toContain('href="https://example.com/review"');
  expect(html).toContain('G2 review');
});
