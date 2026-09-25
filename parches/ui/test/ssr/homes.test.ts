/**
 * What the example homes asked for: product cards, a featured case, reviews
 * with stars and photos, the overlay hero, quiet stats, unboxed strips, the
 * one-line footer, booking slots with a second line.
 */
import { test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Products from '../../src/widgets/Products.astro';
import Cases from '../../src/widgets/Cases.astro';
import Testimonials from '../../src/widgets/Testimonials.astro';
import Hero from '../../src/widgets/Hero.astro';
import Stats from '../../src/widgets/Stats.astro';
import Features from '../../src/widgets/Features.astro';
import Brands from '../../src/widgets/Brands.astro';
import Footer from '../../src/layout/Footer.astro';
import Contact from '../../src/widgets/Contact.astro';
import Screenshot from '../../src/widgets/Screenshot.astro';

let container: AstroContainer | null = null;
async function render(Widget: any, props: Record<string, unknown>, slots?: Record<string, string>) {
  container ??= await AstroContainer.create();
  return container.renderToString(Widget, { props, slots });
}

test('Products: badge on the photo, price beside honest stock, restock only when sold out', async () => {
  const html = await render(Products, {
    items: [
      { name: 'The Moss weekender', price: '£248', badge: 'Bestseller', stock: { label: 'In stock', state: 'in' }, rating: { value: 4.9, count: 212 }, href: '/moss' },
      { name: 'Card wallet', price: '£48', stock: { label: 'Sold out', state: 'out' }, restock: { text: 'Email me when it is back', href: '#restock' } },
    ],
  });
  expect(html).toContain('Bestseller');
  expect(html).toMatch(/text-success[^>]*>In stock/);
  expect(html).toContain('4.9 ★ · 212 reviews');
  expect(html).toContain('href="#restock"');
  expect(html.match(/Email me when it is back/g)?.length).toBe(1);
});

test('Cases: a featured case with its quote; results can lead each case', async () => {
  const html = await render(Cases, {
    results: 'top',
    items: [
      { client: 'Cadence', title: 'Rebrand', featured: true, results: [{ value: '+38%', label: 'demo requests', tone: 'success' }], quote: { text: 'It worked.', name: 'Dan Okoye' }, footer: '11 weeks' },
      { client: 'Quietmile', title: 'Website', results: [{ value: '2.4×', label: 'signups' }] },
    ],
  });
  expect(html).toContain('col-span-full');
  expect(html).toContain('<blockquote');
  expect(html).toContain('11 weeks');
  expect(html).toMatch(/2\.4×[\s\S]*Quietmile/);
});

test('Testimonials: stars for a rating, a photo on top, no empty portrait when asked', async () => {
  const html = await render(Testimonials, { avatars: false, note: 'The third one is a complaint.', items: [{ text: 'Lovely', name: 'Helen', rating: 4, placeholder: 'customer photo' }] });
  expect(html).toContain('aria-label="4 out of 5"');
  expect(html).toContain('customer photo');
  expect(html).not.toContain('size-[34px] flex-none rounded-full');
  expect(html).toContain('The third one is a complaint.');
});

test('Hero overlay: the copy on a card over the media, a note under the actions, proof first', async () => {
  const html = await render(Hero, { layout: 'overlay', title: 'A weekend bag', actions: [{ text: 'Add to basket', href: '#buy' }], note: '60-day returns', proofFirst: true }, { media: '<div data-media></div>', proof: '<p data-price>£248</p>' });
  expect(html).toContain('data-layout="overlay"');
  expect(html).toMatch(/data-price[\s\S]*href="#buy"[\s\S]*60-day returns/);
});

test('Stats inline, Features strip and placeholders, Brands note and second lines', async () => {
  expect(await render(Stats, { layout: 'inline', items: [{ value: '31', label: 'projects' }] })).toContain('data-layout="inline"');
  const strip = await render(Features, { layout: 'strip', items: [{ title: '60-day returns', description: 'We pay the postage' }] });
  expect(strip).not.toContain('bg-border');
  const gallery = await render(Features, { layout: 'gallery', items: [{ title: 'Weekend bags', placeholder: 'category shot · 800×1000' }] });
  expect(gallery).toContain('category shot · 800×1000');
  const brands = await render(Brands, { layout: 'strip', label: 'Recognition', names: [{ name: 'Awwwards', note: 'Site of the day · 2025' }], note: '31 projects since 2019' });
  expect(brands).toContain('Site of the day · 2025');
  expect(brands).toMatch(/text-muted">31 projects since 2019/);
});

test('Footer minimal: one line, the copyright and a row of links', async () => {
  const html = await render(Footer, { layout: 'minimal', copyright: '© 2026 Nocta', secondaryLinks: [{ label: 'Privacy', href: '/privacy' }] });
  expect(html).toContain('data-layout="minimal"');
  expect(html).toContain('© 2026 Nocta');
  expect(html).toContain('href="/privacy"');
});

test('Booking slots: a second line, and a fully booked one that is not a link', async () => {
  const html = await render(Contact, { layout: 'split', fields: [{ name: 'phone', type: 'tel' }], booking: { slots: [{ label: 'Tue 16', detail: '08:00–12:00', href: '#t' }, { label: 'Wed 17', detail: 'fully booked', href: '#w', disabled: true }] } });
  expect(html).toContain('08:00–12:00');
  expect(html).toContain('aria-disabled="true"');
  expect(html).not.toContain('href="#w"');
  expect(html).not.toContain('Next available');
});

test('Screenshot phone: a bezel, and side screens hidden from assistive tech', async () => {
  const html = await render(Screenshot, { device: 'phone', ratio: '9/19.5', muted: true, decorative: true });
  expect(html).toContain('parche-phone');
  expect(html).toContain('aria-hidden="true"');
});
