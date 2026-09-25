/**
 * The shared heading: every section widget takes the same five fields,
 * renders them through one header, and the builder draws one form for them.
 */
import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Features from '../../src/widgets/Features.astro';
import Stats from '../../src/widgets/Stats.astro';
import Cases from '../../src/widgets/Cases.astro';
import FAQs from '../../src/widgets/FAQs.astro';
import Steps from '../../src/widgets/Steps.astro';
import Team from '../../src/widgets/Team.astro';
import Brands from '../../src/widgets/Brands.astro';
import Content from '../../src/widgets/Content.astro';
import Pricing from '../../src/widgets/Pricing.astro';
import Testimonials from '../../src/widgets/Testimonials.astro';
import * as schemas from '../../src/widgets/Features.props';

let container: AstroContainer | null = null;
async function render(Widget: any, props: Record<string, unknown>) {
  container ??= await AstroContainer.create();
  return container.renderToString(Widget, { props });
}

const heading = { tagline: 'Proof', title: 'Measured', subtitle: 'Where and when', link: { text: 'All of it', href: '#all' }, align: 'start' };

test.each([
  ['Features', Features],
  ['Stats', Stats],
  ['Cases', Cases],
  ['FAQs', FAQs],
  ['Steps', Steps],
  ['Team', Team],
  ['Brands', Brands],
  ['Content', Content],
  ['Pricing', Pricing],
  ['Testimonials', Testimonials],
])('%s renders the shared heading with its link', async (_, Widget) => {
  const html = await render(Widget, heading);
  expect(html).toContain('parche-section-header');
  expect(html).toContain('Proof');
  expect(html).toContain('>Measured</h2>');
  expect(html).toContain('href="#all"');
  expect(html).not.toMatch(/parche-section-header[^"]*text-center/);
});

test('align centres the heading where the widget defaults to start', async () => {
  const html = await render(Cases, { ...heading, align: 'center' });
  expect(html).toMatch(/parche-section-header[^"]*text-center/);
});

test('the heading fields come first in the builder form', () => {
  expect(schemas.meta.ui?.groups?.[0]).toMatchObject({ key: 'heading', fields: ['tagline', 'title', 'subtitle', 'link', 'align'] });
});
