import { describe, it, expect } from 'vitest';
import { render, scriptCount } from './_render';
import AspectRatio from '../../src/aspect-ratio/AspectRatio.astro';
import Avatar from '../../src/avatar/Avatar.astro';
import Image from '../../src/image/Image.astro';

describe('Avatar', () => {
  it('shows initials as a named image when there is no picture', async () => {
    const html = await render(Avatar, { name: 'Ada Lovelace' });
    expect(html).toMatch(/role="img"[^>]*aria-label="Ada Lovelace"/);
    expect(html).toMatch(/aria-hidden="true">AL</);
    expect(scriptCount(html)).toBe(0);
  });
  it('renders the picture with the name as alt', async () => {
    const html = await render(Avatar, { name: 'Grace Hopper', src: 'https://x/p.jpg', size: 'xl' });
    expect(html).toMatch(/<img[^>]+src="https:\/\/x\/p\.jpg"[^>]+alt="Grace Hopper"/);
    expect(html).toMatch(/size-16/);
  });
  it('falls back to an unknown person', async () => {
    expect(await render(Avatar)).toMatch(/aria-label="Unknown person"/);
  });
});

describe('Image', () => {
  it('renders a remote URL it cannot optimise as a plain img with dimensions', async () => {
    // The playground allows https hosts (remotePatterns), not http ones.
    const html = await render(Image, { src: 'http://x/a.jpg', alt: 'A', width: 400 });
    expect(html).toMatch(/<img[^>]+src="http:\/\/x\/a\.jpg"/);
    expect(html).toMatch(/width="400"/);
    expect(html).toMatch(/height="225"/);
    expect(html).toMatch(/loading="lazy"/);
    expect(html).toMatch(/data-path="plain"/);
    expect(scriptCount(html)).toBe(0);
  });
  it('a ratio crops with object-fit and reserves its height', async () => {
    const html = await render(Image, { src: 'http://x/a.jpg', alt: 'A', ratio: '1/1' });
    expect(html).toMatch(/data-ratio="1\/1"/);
    expect(html).toMatch(/aspect-square/);
    expect(html).toMatch(/object-cover/);
    expect(html).toMatch(/width="800"[^>]*height="800"/);
  });
  it('an image CDN it recognises serves every width, cropped, with sizes', async () => {
    const html = await render(Image, { src: 'https://images.unsplash.com/photo-1?w=2000&q=80', alt: 'A', width: 640, ratio: '16/10' });
    expect(html).toMatch(/data-path="cdn"/);
    expect(html).toMatch(/src="https:\/\/images\.unsplash\.com\/photo-1\?[^"]*w=640&amp;h=400/);
    expect(html).toMatch(/srcset="[^"]*w=1080&amp;h=675[^"]* 1080w/);
    expect(html).toMatch(/sizes="\(min-width: 640px\) 640px, 100vw"/);
  });
  it('priority loads the main picture at once and first', async () => {
    const html = await render(Image, { src: 'https://images.unsplash.com/photo-1', alt: 'A', priority: true });
    expect(html).toMatch(/loading="eager"/);
    expect(html).toMatch(/fetchpriority="high"/);
  });
  it('a local picture goes through Astro, responsive', async () => {
    const local = { src: '/src/assets/a.jpg', width: 2000, height: 1000, format: 'jpg' };
    const html = await render(Image, { src: local, alt: 'A', width: 800 });
    expect(html).toMatch(/data-path="local"/);
    expect(html).toMatch(/srcset="/);
    expect(html).toMatch(/height="400"/);
  });
  it('an allowed remote host that does not answer goes out as it is, without failing', async () => {
    const html = await render(Image, { src: 'https://unreachable.invalid/a.jpg', alt: 'A', width: 400 });
    expect(html).toMatch(/data-path="plain"/);
    expect(html).toMatch(/src="https:\/\/unreachable\.invalid\/a\.jpg"/);
  });
  it('a local SVG stays as it is', async () => {
    const html = await render(Image, { src: { src: '/_astro/a.svg', width: 100, height: 50, format: 'svg' }, alt: 'A', width: 200 });
    expect(html).toMatch(/<img[^>]+src="\/_astro\/a\.svg"[^>]*|data-path="plain"[^>]*src="\/_astro\/a\.svg"/);
    expect(html).toMatch(/height="100"/);
  });
});

describe('AspectRatio', () => {
  it('sets the ratio as CSS and stretches the child, no script', async () => {
    const html = await render(AspectRatio, { ratio: '4 / 3' }, { default: '<img src="/a.png" alt="" />' });
    expect(html).toMatch(/style="aspect-ratio: 4 \/ 3"[^>]*data-part="root"[^>]*data-ratio="4\/3"/);
    expect(html).toContain('<img src="/a.png" alt="" />');
    expect(scriptCount(html)).toBe(0);
  });
});
