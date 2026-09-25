/**
 * The widgets the redesign replica added: each renders its content with the
 * structure the design needs.
 */
import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Showcase from '../../src/widgets/Showcase.astro';
import Cases from '../../src/widgets/Cases.astro';
import Team from '../../src/widgets/Team.astro';
import Timeline from '../../src/widgets/Timeline.astro';
import Newsletter from '../../src/widgets/Newsletter.astro';
import Pricing from '../../src/widgets/Pricing.astro';

let container: AstroContainer | null = null;
async function render(Component: any, props: Record<string, unknown>) {
  container ??= await AstroContainer.create();
  return container.renderToString(Component, { props });
}

test('Showcase: the heading shares the row with a segmented switcher, one panel per demo', async () => {
  const html = await render(Showcase, {
    title: 'Five sites',
    items: [
      { value: 'saas', label: 'SaaS', title: 'SaaS demo', description: 'Pricing and docs', points: ['One', 'Two'], caption: 'saas · 1000×625', link: { text: 'Open', href: '/saas' } },
      { value: 'agency', label: 'Agency', title: 'Agency demo', description: 'Cases', points: [] },
    ],
  });
  expect(html).toContain('data-part="header"');
  expect(html).toContain('role="tablist"');
  expect(html).toContain('SaaS demo');
  expect(html).toContain('Agency demo');
  expect(html).toContain('href="/saas"');
});

test('Cases: client and sector, the title and three results with a tone', async () => {
  const html = await render(Cases, {
    title: 'Real sites',
    link: { text: 'All cases', href: '/work' },
    items: [{ client: 'Northwind', sector: 'SaaS', title: 'Off the CMS', results: [{ value: '−71%', label: 'LCP', tone: 'success' }, { value: '9 d', label: 'To launch' }] }],
  });
  expect(html).toContain('Northwind · SaaS');
  expect(html).toContain('Off the CMS');
  expect(html).toMatch(/text-success[^>]*>−71%/);
  expect(html).toContain('href="/work"');
});

test('Team, Timeline and Newsletter render their parts', async () => {
  const team = await render(Team, { title: 'Maintainers', items: [{ name: 'L. Fontana', role: 'Accessibility' }], more: { count: '+180', label: 'Contributors' } });
  expect(team).toContain('L. Fontana');
  expect(team).toContain('+180');
  expect(team).toContain('aria-label="L. Fontana"');
  const timeline = await render(Timeline, { title: 'Changelog', items: [{ label: '2026', title: 'v1.0', highlight: true }] });
  expect(timeline).toMatch(/text-primary[^>]*>2026/);
  const news = await render(Newsletter, { title: 'New articles', note: 'Unsubscribe any time' });
  expect(news).toContain('type="email"');
  expect(news).toContain('Unsubscribe any time');
});

test('Pricing: the recommended tier is marked and the comparison has one column per plan', async () => {
  const html = await render(Pricing, {
    items: [
      { title: 'Free', type: 'custom', price: 'Free' },
      { title: 'Studio', price: '149', suffix: 'once', recommended: true, badge: 'Most picked' },
    ],
    comparison: { rows: [{ feature: 'Widgets', values: [{ text: '34', tone: 'muted' }, { text: '46' }] }] },
  });
  expect(html).toContain('Most picked');
  expect(html).toContain('$149');
  expect(html).toMatch(/<th scope="col"[^>]*bg-primary-soft[^>]*>Studio/);
  expect(html).toContain('<th scope="row"');
});

test('Gallery: the heading, the hint beside it, thumbnails that link to their full image', async () => {
  const { default: Gallery } = await import('../../src/widgets/Gallery.astro');
  const html = await render(Gallery, {
    title: 'Eight pieces',
    hint: '← → to move · Esc to close',
    items: [{ image: { src: 'https://example.com/a.png', alt: 'A' }, full: { src: 'https://example.com/a-full.png', alt: 'A' }, caption: 'First' }, { caption: 'Second', placeholder: 'work image · 2000×1250' }],
  });
  expect(html).toContain('← → to move · Esc to close');
  expect(html).toContain('href="https://example.com/a-full.png"');
  expect(html).toContain('<dialog');
  expect(html).toContain('work image · 2000×1250');
});

test('Releases: each release anchored, its changes typed, the filter over them', async () => {
  const { default: Releases } = await import('../../src/widgets/Releases.astro');
  const html = await render(Releases, {
    items: [
      { version: '3.4.0', date: '11 September 2026', latest: true, title: 'Read receipts', changes: [{ type: 'new', text: 'Per-account receipts' }, { type: 'breaking', text: '`GET /v1/notes` paginates at 50' }] },
      { version: '3.3.2', date: '28 August 2026', changes: [{ type: 'fixed', text: 'Alt text' }] },
    ],
    jump: { links: [{ text: 'RSS feed', href: '/rss.xml' }] },
  });
  expect(html).toContain('<parche-filter');
  expect(html).toContain('id="v3-4-0"');
  expect(html).toContain('data-filter="new breaking"');
  expect(html).toContain('href="#v3-3-2"');
  expect(html).toContain('<code class="parche-code">GET /v1/notes</code>');
  expect(html).toContain('3.3.2 · Aug');
});
