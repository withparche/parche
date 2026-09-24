/**
 * The Hero on the node model: three layouts, the media slot replacing the
 * image, the proof slot under the actions.
 */
import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Hero from '../../src/widgets/Hero.astro';

let container: AstroContainer | null = null;
async function render(props: Record<string, unknown>, slots?: Record<string, string>) {
  container ??= await AstroContainer.create();
  return container.renderToString(Hero, { props, slots });
}

const copy = { tagline: 'Legal', title: 'Privacy', subtitle: 'What we collect', actions: [{ text: 'Read', href: '#more' }] };

test('center: copy above the image, actions centred', async () => {
  const html = await render({ ...copy, image: { src: 'https://example.com/a.png', alt: 'A' } });
  expect(html).toContain('data-layout="center"');
  expect(html).toContain('<h1 class="type-h1 mb-4 text-balance">Privacy</h1>');
  expect(html).toContain('parche-hero-media');
  expect(html).toContain('alt="A"');
  expect(html).toContain('href="#more"');
});

test('split: copy and media side by side; text: no media area even with an image', async () => {
  const split = await render({ ...copy, layout: 'split', image: { src: 'https://example.com/a.png', alt: 'A' } });
  expect(split).toContain('data-layout="split"');
  expect(split).toContain('md:flex-row');
  expect(split).toContain('md:basis-1/2');
  const text = await render({ ...copy, layout: 'text', image: { src: 'https://example.com/a.png', alt: 'A' } });
  expect(text).toContain('data-layout="text"');
  expect(text).not.toContain('parche-hero-media');
});

test('the media slot replaces the image and the proof slot lands under the actions', async () => {
  const html = await render(
    { ...copy, image: { src: 'https://example.com/a.png', alt: 'A' } },
    { media: '<form data-form></form>', proof: '<p data-proof>4.8 from 317 reviews</p>' },
  );
  expect(html).toContain('<form data-form></form>');
  expect(html).not.toContain('alt="A"');
  expect(html).toMatch(/href="#more"[\s\S]*parche-hero-proof[\s\S]*data-proof/);
});

test('no image and no media slot: no media area at all', async () => {
  const html = await render(copy);
  expect(html).not.toContain('parche-hero-media');
  expect(html).not.toContain('parche-hero-proof');
});
