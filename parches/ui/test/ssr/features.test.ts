/**
 * The Features widget on the node model: three styles, the media slot above
 * the items, the image as its fallback.
 */
import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Features from '../../src/widgets/Features.astro';

let container: AstroContainer | null = null;
async function render(props: Record<string, unknown>, slots?: Record<string, string>) {
  container ??= await AstroContainer.create();
  return container.renderToString(Features, { props, slots });
}

const base = {
  title: 'What you get',
  items: [
    { title: 'Fast', description: 'Ships in a day', icon: 'tabler:bolt', callToAction: { text: 'More', href: '#fast' } },
    { title: 'Small', description: 'Tiny bundle' },
  ],
};

test('grid: an icon badge beside each item; cards: each item on a card; list: compact rows', async () => {
  const grid = await render(base);
  expect(grid).toContain('data-style="grid"');
  expect(grid).toContain('rounded-full bg-primary text-on-primary');
  expect(grid).toContain('href="#fast"');
  const cards = await render({ ...base, style: 'cards' });
  expect(cards).toContain('data-style="cards"');
  expect(cards).toContain('parche-card');
  expect(cards).not.toContain('rounded-full bg-primary');
  const list = await render({ ...base, style: 'list' });
  expect(list).toContain('data-style="list"');
  expect(list).toContain('text-lg font-semibold');
});

test('the media slot sits above the items and replaces the image', async () => {
  const withImage = await render({ ...base, image: { src: 'https://example.com/shot.png', alt: 'Shot' } });
  expect(withImage).toContain('parche-features-media');
  expect(withImage).toContain('alt="Shot"');
  const withSlot = await render({ ...base, image: { src: 'https://example.com/shot.png', alt: 'Shot' } }, { media: '<video data-video></video>' });
  expect(withSlot).toContain('<video data-video></video>');
  expect(withSlot).not.toContain('alt="Shot"');
  expect(withSlot).toMatch(/parche-features-media[\s\S]*data-video[\s\S]*Ships in a day/);
  const none = await render(base);
  expect(none).not.toContain('parche-features-media');
});
