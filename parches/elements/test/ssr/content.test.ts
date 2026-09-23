import { describe, it, expect } from 'vitest';
import { render, scriptCount } from './_render';
import Heading from '../../src/heading/Heading.astro';
import Card from '../../src/card/Card.astro';
import Kbd from '../../src/kbd/Kbd.astro';
import Code from '../../src/code/Code.astro';
import Prose from '../../src/prose/Prose.astro';
import Video from '../../src/video/Video.astro';
import Skeleton from '../../src/skeleton/Skeleton.astro';
import Breadcrumb from '../../src/breadcrumb/Breadcrumb.astro';
import Pagination from '../../src/pagination/Pagination.astro';

describe('Heading', () => {
  it('renders eyebrow, h2 and subtitle centred by default', async () => {
    const html = await render(Heading, { tagline: 'Features', title: 'Title <em>x</em>', subtitle: 'Sub' });
    expect(html).toMatch(/data-part="tagline"/);
    expect(html).toMatch(/<h2[^>]*type-h2[^>]*data-part="title"[^>]*>Title <em>x<\/em><\/h2>/);
    expect(html).toMatch(/data-part="subtitle"/);
    expect(html).toMatch(/text-center/);
    expect(scriptCount(html)).toBe(0);
  });
  it('level and align change the tag and layout; empty renders nothing', async () => {
    const html = await render(Heading, { title: 'T', level: 3, align: 'start' });
    expect(html).toMatch(/<h3[^>]*type-h3/);
    expect(html).not.toMatch(/text-center/);
    expect((await render(Heading)).trim()).toBe('');
  });
});

describe('Card', () => {
  it('is a bordered surface with body, header and footer parts', async () => {
    const html = await render(Card, {}, { default: 'Body', header: 'Head', footer: 'Foot' });
    expect(html).toMatch(/<div[^>]*parche-card[^>]*bg-surface[^>]*border-border/);
    for (const part of ['body', 'header', 'footer']) expect(html).toMatch(new RegExp(`data-part="${part}"`));
    expect(html).not.toMatch(/data-part="media"/);
  });
  it('with href it is one link, interactive, with a focus ring', async () => {
    const html = await render(Card, { href: '/x' }, { default: 'Body' });
    expect(html).toMatch(/<a[^>]+href="\/x"[^>]*data-state="interactive"/);
    expect(html).toMatch(/outline-ring/);
  });
});

describe('Kbd and Code', () => {
  it('a combination nests kbd in kbd', async () => {
    const html = await render(Kbd, { keys: ['⌘', 'K'] });
    expect(html.match(/<kbd/g)?.length).toBe(3);
    expect(html).toMatch(/data-part="key"/);
  });
  it('code is inline by default and a pre block with lang', async () => {
    expect(await render(Code, {}, { default: 'x' })).toMatch(/^<code[^>]*parche-code/);
    const block = await render(Code, { block: true, lang: 'json' }, { default: '{}' });
    expect(block).toMatch(/<pre[^>]*data-lang="json"[^>]*><code class="language-json">/);
  });
});

describe('Prose', () => {
  it('renders html or the slot inside .prose', async () => {
    expect(await render(Prose, { html: '<p>hi</p>', size: 'lg' })).toMatch(/class="[^"]*parche-prose prose[^"]*text-lg"[^>]*><p>hi<\/p>/);
    expect(await render(Prose, {}, { default: '<p>slot</p>' })).toMatch(/<p>slot<\/p>/);
  });
});

describe('Video', () => {
  it('turns a YouTube URL into a nocookie lazy iframe with a title', async () => {
    const html = await render(Video, { src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Tour' });
    expect(html).toMatch(/<iframe[^>]+src="https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ"/);
    expect(html).toMatch(/title="Tour"/);
    expect(html).toMatch(/loading="lazy"/);
    expect(html).toMatch(/data-provider="youtube"/);
  });
  it('a file URL is a native video with controls', async () => {
    const html = await render(Video, { src: 'https://x/a.mp4', title: 'A', poster: 'https://x/p.jpg' });
    expect(html).toMatch(/<video[^>]+controls/);
    expect(html).toMatch(/poster="https:\/\/x\/p\.jpg"/);
    expect(html).toMatch(/data-provider="file"/);
  });
});

describe('Skeleton', () => {
  it('is hidden from assistive tech and respects reduced motion', async () => {
    const html = await render(Skeleton, { lines: 2 });
    expect(html).toMatch(/aria-hidden="true"/);
    expect(html).toMatch(/motion-safe:animate-pulse/);
    expect(html.match(/data-part="line"/g)?.length).toBe(2);
  });
});

describe('Breadcrumb', () => {
  it('is a labelled nav with the last item current and unlinked', async () => {
    const html = await render(Breadcrumb, { items: [{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: 'Post', href: '/blog/post' }] });
    expect(html).toMatch(/<nav[^>]+aria-label="Breadcrumb"/);
    expect(html).toMatch(/<ol/);
    expect(html).toMatch(/<span[^>]*aria-current="page"[^>]*>Post</);
    expect(html).not.toMatch(/href="\/blog\/post"/);
    expect(html.match(/data-part="separator"/g)?.length).toBe(2);
  });
});

describe('Pagination', () => {
  it('first page: prev disabled in place, next linked, numbers with a gap', async () => {
    const html = await render(Pagination, { current: 1, total: 8, base: '/blog' });
    expect(html).toMatch(/data-part="prev"[^>]*data-state="disabled"[^>]*aria-disabled="true"/);
    expect(html).toMatch(/<a href="\/blog\/2"[^>]*data-part="next"[^>]*rel="next"/);
    expect(html).toMatch(/aria-current="page"[^>]*>1</);
    expect(html).toMatch(/data-part="ellipsis"/);
    expect(html).toMatch(/aria-label="Page 8"/);
  });
  it('page 1 links back to base itself; numbers can be hidden', async () => {
    const html = await render(Pagination, { current: 2, total: 3, base: '/blog/', numbers: false });
    expect(html).toMatch(/<a href="\/blog"[^>]*data-part="prev"/);
    expect(html).not.toMatch(/data-part="page"/);
  });
});
