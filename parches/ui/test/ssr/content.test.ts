/**
 * Content: text and items beside a media slot, the image as its fallback.
 */
import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Content from '../../src/widgets/Content.astro';

let container: AstroContainer | null = null;
async function render(props: Record<string, unknown>, slots?: Record<string, string>) {
  container ??= await AstroContainer.create();
  return container.renderToString(Content, { props, slots });
}

const base = { title: 'Why it works', content: '<p>Six units.</p>', items: [{ title: 'Fast', description: 'Ships' }], actions: [{ text: 'More', href: '#more' }] };

test('without media the text takes the full width; with an image or a slot it takes half', async () => {
  const bare = await render(base);
  expect(bare).not.toContain('parche-content-media');
  expect(bare).toContain('w-full');
  const withImage = await render({ ...base, image: { src: 'https://example.com/a.png', alt: 'A' }, reversed: true });
  expect(withImage).toContain('parche-content-media');
  expect(withImage).toContain('alt="A"');
  expect(withImage).toContain('md:flex-row-reverse');
  const withSlot = await render({ ...base, image: { src: 'https://example.com/a.png', alt: 'A' } }, { media: '<video data-video></video>' });
  expect(withSlot).toContain('<video data-video></video>');
  expect(withSlot).not.toContain('alt="A"');
  expect(withSlot).toContain('href="#more"');
});
