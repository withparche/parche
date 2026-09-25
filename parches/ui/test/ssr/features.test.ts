/**
 * The Features widget on the node model: five layouts, the media slot above
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
    { title: 'Fast', description: 'Ships in a day', icon: 'tabler:bolt', link: { text: 'More', href: '#fast' } },
    { title: 'Small', description: 'Tiny bundle' },
  ],
};

test('grid: an icon badge beside each item; cards: each item on a card; list: compact rows', async () => {
  const grid = await render(base);
  expect(grid).toContain('data-layout="grid"');
  expect(grid).toContain('rounded-full bg-primary text-on-primary');
  expect(grid).toContain('href="#fast"');
  const cards = await render({ ...base, layout: 'cards' });
  expect(cards).toContain('data-layout="cards"');
  expect(cards).toContain('parche-card');
  expect(cards).not.toContain('rounded-full bg-primary');
  const list = await render({ ...base, layout: 'list' });
  expect(list).toContain('data-layout="list"');
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

test('a rich card: eyebrow, title with a price, points under a rule, footer at the bottom, whole card a link', async () => {
  const html = await render({
    layout: 'cards',
    items: [
      { eyebrow: '8–14 weeks', title: 'Brand identity', aside: 'from €55K', description: 'Strategy to system.', points: ['Research', 'Logo'], footer: 'Led by Núria', href: '/services/brand' },
      { title: 'Security', tone: 'danger', description: 'Report a vulnerability.' },
    ],
  });
  expect(html).toContain('8–14 weeks');
  expect(html).toMatch(/text-primary[^>]*>from €55K</);
  expect(html).toMatch(/border-t border-border-soft pt-3\.5/);
  expect(html).toContain('Led by Núria');
  expect(html).toMatch(/<a[^>]+href="\/services\/brand"/);
  expect(html).toMatch(/border-danger bg-danger-soft/);
  // Points or a footer make every card rich: the larger radius and padding.
  expect(html).toContain('--ds-comp-card-padding-lg');
});

test('rows put the eyebrow and the aside in side columns; gallery draws image tiles', async () => {
  const rows = await render({ layout: 'rows', items: [{ eyebrow: 'Weeks 1–2', title: 'Foundations', description: 'Tokens', aside: '2 wk', footer: 'You finish with: a theme' }] });
  expect(rows).toContain('parche-list');
  expect(rows).toContain('grid-cols-[auto_1fr_auto]');
  expect(rows).toContain('You finish with: a theme');
  const gallery = await render({ layout: 'gallery', items: [{ title: 'Sofas', description: '6 styles', image: { src: 'https://example.com/a.png', alt: 'Sofa' }, href: '/sofas' }] });
  expect(gallery).toMatch(/<a[^>]+href="\/sofas"/);
  expect(gallery).toContain('alt="Sofa"');
});

test('header side puts the heading in a column beside the items; panels show the eyebrow for the number', async () => {
  const html = await render({ header: 'side', title: 'Three decisions', layout: 'panels', items: [{ eyebrow: 'A', title: 'x' }, { title: 'y' }] });
  expect(html).toContain('minmax(min(290px,100%),1fr)');
  expect(html).toMatch(/text-primary"[^>]*>A</);
  expect(html).toMatch(/text-primary"[^>]*>02</);
});
