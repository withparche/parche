/**
 * The containers: Columns with Column children, and Switch forwarding its
 * per-option slots to the Tabs element.
 */
import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Columns from '../../src/widgets/Columns.astro';
import Column from '../../src/widgets/Column.astro';
import Switch from '../../src/widgets/Switch.astro';

let container: AstroContainer | null = null;
async function render(Component: any, props: Record<string, unknown>, slots?: Record<string, string>) {
  container ??= await AstroContainer.create();
  return container.renderToString(Component, { props, slots });
}

test('Columns carries the ratio, gap, alignment and stack breakpoint as data and classes', async () => {
  const html = await render(Columns, { ratio: 'wide-start', gap: 'lg', align: 'center', stack: 'lg' }, { default: '<div>a</div><div>b</div>' });
  expect(html).toContain('data-ratio="wide-start"');
  expect(html).toContain('data-stack="lg"');
  expect(html).toContain('gap-8 md:gap-16');
  expect(html).toContain('items-center');
  expect(html).toContain('<div>a</div><div>b</div>');
});

test('Column picks its tag, sticks when asked, and names itself', async () => {
  const aside = await render(Column, { as: 'aside', sticky: true, label: 'On this page' }, { default: '<nav>toc</nav>' });
  expect(aside).toMatch(/^<aside [^>]*aria-label="On this page"[^>]*><nav>toc<\/nav><\/aside>$/);
  expect(aside).toContain('md:sticky');
  const div = await render(Column, {}, { default: '<p>x</p>' });
  expect(div).toMatch(/^<div class="parche-column [^"]*"><p>x<\/p><\/div>$/);
  expect(div).not.toContain('sticky');
});

test('Switch renders one tab per option and puts each named slot in its panel', async () => {
  const html = await render(
    Switch,
    { options: [{ value: 'agency', label: 'Agency' }, { value: 'saas', label: 'SaaS' }], syncKey: 'kind', label: 'I am building' },
    { agency: '<p data-agency>agency demo</p>', saas: '<p data-saas>saas demo</p>' },
  );
  expect(html).toContain('role="tablist"');
  expect(html).toContain('Agency');
  expect(html).toContain('SaaS');
  expect(html).toContain('<p data-agency>agency demo</p>');
  expect(html).toContain('<p data-saas>saas demo</p>');
  expect(html).toContain('sync-key="kind"');
});
