/**
 * CallToAction: three arrangements of one headline and one action.
 */
import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import CallToAction from '../../src/widgets/CallToAction.astro';

let container: AstroContainer | null = null;
async function render(props: Record<string, unknown>) {
  container ??= await AstroContainer.create();
  return container.renderToString(CallToAction, { props });
}

const base = { title: 'Same command as the top', subtitle: 'npm create parche@latest', actions: [{ text: 'Clone it', href: '#get' }] };

test('card is a centred panel, band spreads headline and action, inline is one bordered row', async () => {
  const card = await render(base);
  expect(card).toContain('data-layout="card"');
  expect(card).toContain('parche-card');
  const band = await render({ ...base, layout: 'band' });
  expect(band).toContain('data-layout="band"');
  expect(band).toContain('justify-between');
  expect(band).not.toContain('parche-card');
  const inline = await render({ ...base, layout: 'inline' });
  expect(inline).toContain('data-layout="inline"');
  expect(inline).toContain('border border-border');
  expect(inline).toContain('href="#get"');
});
