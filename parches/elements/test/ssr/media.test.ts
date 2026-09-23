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
  it('renders a remote URL as a plain img with dimensions', async () => {
    const html = await render(Image, { src: 'https://x/a.jpg', alt: 'A', width: 400 });
    expect(html).toMatch(/<img[^>]+src="https:\/\/x\/a\.jpg"/);
    expect(html).toMatch(/width="400"/);
    expect(html).toMatch(/height="225"/);
    expect(html).toMatch(/loading="lazy"/);
    expect(scriptCount(html)).toBe(0);
  });
  it('a ratio crops with object-fit and drops the computed height', async () => {
    const html = await render(Image, { src: 'https://x/a.jpg', alt: 'A', ratio: '1/1' });
    expect(html).toMatch(/data-ratio="1\/1"/);
    expect(html).toMatch(/aspect-square/);
    expect(html).toMatch(/object-cover/);
    expect(html).not.toMatch(/height="/);
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
