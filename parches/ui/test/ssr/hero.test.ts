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
  expect(html).toMatch(/<h1 class="type-h1[^"]*">Privacy<\/h1>/);
  expect(html).toContain('parche-hero-media');
  expect(html).toContain('alt="A"');
  expect(html).toContain('href="#more"');
});

test('split: copy and media side by side; text: no media area even with an image', async () => {
  const split = await render({ ...copy, layout: 'split', image: { src: 'https://example.com/a.png', alt: 'A' } });
  expect(split).toContain('data-layout="split"');
  // Two columns on the design's grid: auto-fit, 320px minimum, left-aligned copy.
  expect(split).toContain('grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]');
  expect(split).not.toContain('text-center');
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

test('a badge replaces the tagline: the quiet part and the accented tag', async () => {
  const html = await render({ ...copy, badge: { text: 'Free · MIT', tag: 'v1.0' } });
  expect(html).toContain('data-part="badge"');
  expect(html).toContain('Free · MIT');
  expect(html).toContain('v1.0');
  expect(html).not.toContain('type-label');
});

test('no image and no media slot: no media area at all', async () => {
  const html = await render(copy);
  expect(html).not.toContain('parche-hero-media');
  expect(html).not.toContain('parche-hero-proof');
});

test('side: the heading on the left, the subtitle and actions beside it; md sets a page title', async () => {
  const html = await render({ ...copy, layout: 'side', size: 'md' });
  expect(html).toContain('parche-hero-aside');
  expect(html).toMatch(/<h1 class="font-heading text-\[clamp\(2\.25rem/);
  expect(html).toMatch(/parche-hero-aside[\s\S]*What we collect[\s\S]*href="#more"/);
});

test('align start keeps a centre layout on the left', async () => {
  const html = await render({ ...copy, align: 'start' });
  expect(html).not.toContain('text-center');
});
