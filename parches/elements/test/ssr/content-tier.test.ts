import { describe, it, expect } from 'vitest';
import { render, scriptCount } from './_render';
import Toc from '../../src/toc/Toc.astro';
import Share from '../../src/share/Share.astro';
import Stat from '../../src/stat/Stat.astro';
import Banner from '../../src/banner/Banner.astro';

describe('Toc', () => {
  it('nests lists of in-page links under a labelled nav', async () => {
    const html = await render(Toc, { items: [{ text: 'A', slug: 'a', children: [{ text: 'B', slug: 'b' }] }], offset: 64 });
    expect(html).toMatch(/<parche-toc[^>]*offset="64"/);
    expect(html).toMatch(/<nav aria-label="Table of contents"/);
    expect(html).toMatch(/data-part="list" data-depth="0"/);
    expect(html).toMatch(/<a href="#a"[^>]*data-part="link"[^>]*data-slug="a"/);
    expect(html).toMatch(/data-part="list" data-depth="1"[^>]*>[\s\S]*<a href="#b"/);
    expect(html).not.toMatch(/aria-current/);
    expect(scriptCount(html)).toBe(1);
  });
});

describe('Share', () => {
  it('networks are intent links; copy and native are buttons hidden until upgrade', async () => {
    const html = await render(Share, { url: 'https://x.y/p?a=1', title: 'Hi & bye', networks: ['x', 'mail', 'copy'] });
    expect(html).toMatch(/<parche-share role="group" aria-label="Share"/);
    expect(html).toMatch(/<a href="https:\/\/twitter\.com\/intent\/tweet\?url=https%3A%2F%2Fx\.y%2Fp%3Fa%3D1&(amp;)?text=Hi%20%26%20bye" target="_blank" rel="noopener noreferrer"[^>]*aria-label="Share on X"/);
    expect(html).toMatch(/<a href="mailto:\?subject=Hi%20%26%20bye/);
    expect(html).toMatch(/<button[^>]*aria-label="Copy link"[^>]*data-network="copy" hidden/);
    expect(html).toMatch(/data-part="native" hidden/);
    expect(html).not.toMatch(/data-network="facebook"/);
    expect(html).toMatch(/role="status"/);
    expect(scriptCount(html)).toBe(1);
  });
});

describe('Stat', () => {
  it('renders the final figure, label and icon', async () => {
    const html = await render(Stat, { value: '$1,200+', label: 'Saved', icon: 'tabler:check' });
    expect(html).toMatch(/<parche-stat[^>]*value="\$1,200\+"/);
    expect(html).toMatch(/<span data-counter>\$1,200\+<\/span>/);
    expect(html).toMatch(/data-part="label"[^>]*>Saved</);
    expect(html).toMatch(/data-part="icon"/);
    expect(scriptCount(html)).toBe(1);
  });
});

describe('Banner', () => {
  it('is a linked message with a dismiss button and an aside', async () => {
    const html = await render(Banner, { text: '<b>New</b>', href: '/x', aside: 'Go', remember: 'k' });
    expect(html).toMatch(/<parche-banner[^>]*data-state="open"[^>]*remember="k"/);
    expect(html).toMatch(/<button[^>]*aria-label="Dismiss"[^>]*data-part="dismiss"/);
    expect(html).toMatch(/<a href="\/x"[^>]*data-part="message"[^>]*>[\s\S]*<b>New<\/b>/);
    expect(html).toMatch(/data-part="aside"[^>]*>Go</);
    const plain = await render(Banner, { text: 'x', dismissible: false });
    expect(plain).not.toMatch(/data-part="dismiss"/);
    expect(plain).toMatch(/<span[^>]*data-part="message"/);
    expect(scriptCount(html)).toBe(1);
  });
});
