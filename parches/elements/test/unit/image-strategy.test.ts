import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cdnSources, hostMatches, readImagesOptions, remotePath, sizesFor, widthsFor } from '../../src/image/image-strategy.ts';

const unsplash = 'https://images.unsplash.com/photo-1?w=2000&q=80';
const other = 'https://example.com/a.jpg';
const yes = () => true;
const no = () => false;

test('remote paths: CDN first, then Astro when it allows the host, else as is', () => {
  assert.deepEqual(remotePath(unsplash, {}, no), { path: 'cdn', provider: 'imgix' });
  assert.deepEqual(remotePath(other, {}, yes), { path: 'astro' });
  assert.deepEqual(remotePath(other, {}, no), { path: 'plain' });
});

test('remote modes: cdn skips Astro, astro skips the CDN, none leaves everything as is', () => {
  assert.deepEqual(remotePath(other, { remote: 'cdn' }, yes), { path: 'plain' });
  assert.deepEqual(remotePath(unsplash, { remote: 'astro' }, yes), { path: 'astro' });
  assert.deepEqual(remotePath(unsplash, { remote: 'none' }, yes), { path: 'plain' });
});

test('cdn options: hosts limit it, providers name your domain, fallback proxies the rest', () => {
  assert.deepEqual(remotePath(unsplash, { cdn: { hosts: ['res.cloudinary.com'] } }, no), { path: 'plain' });
  assert.deepEqual(remotePath('https://img.site.com/a.jpg', { cdn: { providers: { 'img.site.com': 'imgix' } } }, no), { path: 'cdn', provider: 'imgix' });
  assert.deepEqual(remotePath(other, { cdn: { fallback: 'wsrv' } }, no), { path: 'cdn', provider: 'wsrv' });
});

test('host patterns as Astro writes them', () => {
  assert.equal(hostMatches('a.example.com', 'a.example.com'), true);
  assert.equal(hostMatches('a.example.com', '*.example.com'), true);
  assert.equal(hostMatches('a.b.example.com', '*.example.com'), false);
  assert.equal(hostMatches('a.b.example.com', '**.example.com'), true);
  assert.equal(hostMatches('example.com', '*.example.com'), false);
});

test('widths and sizes per layout', () => {
  assert.deepEqual(widthsFor('fixed', 120, [640]), [120, 240]);
  assert.deepEqual(widthsFor('constrained', 640, [640, 828, 1080, 1280, 1668]), [640, 828, 1080, 1280]);
  assert.deepEqual(widthsFor('full-width', 640, [640, 1080]), [640, 1080]);
  assert.equal(sizesFor('constrained', 640), '(min-width: 640px) 640px, 100vw');
  assert.equal(sizesFor('full-width', 640), '100vw');
  assert.equal(sizesFor('fixed', 120), '120px');
});

test('a CDN srcset keeps the crop at every width', () => {
  const s = cdnSources(unsplash, 'imgix', { width: 640, height: 400, layout: 'constrained', breakpoints: [640, 1080] })!;
  assert.match(s.src, /w=640&h=400/);
  assert.match(s.srcset, /w=1080&h=675[^ ]* 1080w/);
  assert.match(s.srcset, /w=1280&h=800[^ ]* 1280w/);
});

test('the options travel as JSON and default when missing or broken', () => {
  assert.deepEqual(readImagesOptions(undefined), {});
  assert.deepEqual(readImagesOptions('nope'), {});
  assert.deepEqual(readImagesOptions('{"remote":"cdn"}'), { remote: 'cdn' });
});
