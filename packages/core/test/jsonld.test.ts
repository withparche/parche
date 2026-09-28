import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBreadcrumbs, buildJsonLdGraph } from '../src/utils/metadata.ts';

const resolved = { title: 'Blog', description: 'Posts', noindex: false, nofollow: false, ogTitle: 'Blog', ogDescription: '', ogType: 'website', twitterCard: 'summary', siteName: 'AstroWind', locale: 'en' } as any;
const config = { brand: { name: 'AstroWind', description: 'A template' } } as any;
const graph = (r = resolved, search?: string) => JSON.parse(buildJsonLdGraph(r, 'https://ex.com/blog', 'https://ex.com', config, undefined, search))['@graph'] as any[];

test('the WebPage node takes the page type a route gives', () => {
  assert.equal(graph().find((n) => n.url === 'https://ex.com/blog')['@type'], 'WebPage');
  assert.equal(graph({ ...resolved, pageType: 'CollectionPage' }).find((n) => n.url === 'https://ex.com/blog')['@type'], 'CollectionPage');
});

test("the WebSite advertises the site's search, absolute", () => {
  assert.equal(graph().find((n) => n['@type'] === 'WebSite').potentialAction, undefined);
  const site = graph(resolved, '/search?q={search_term_string}').find((n) => n['@type'] === 'WebSite');
  assert.deepEqual(site.potentialAction, {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://ex.com/search?q={search_term_string}' },
    'query-input': 'required name=search_term_string',
  });
});

test("a page's own article and trail replace the generated ones, never doubled", () => {
  const article = { ...resolved, ogType: 'article', article: { publishedDate: '2026-01-01' } };
  const trail = [{ name: 'Home', url: 'https://ex.com/' }, { name: 'Blog', url: 'https://ex.com/blog' }];
  const types = (r: any) => JSON.parse(buildJsonLdGraph(r, 'https://ex.com/p', 'https://ex.com', config, trail))['@graph'].map((n: any) => n['@type']);
  assert.ok(types(article).includes('Article'));
  assert.ok(types(article).includes('BreadcrumbList'));
  const own = types({ ...article, jsonLd: [{ '@type': 'BlogPosting' }, { '@type': 'BreadcrumbList' }] });
  assert.deepEqual(own.filter((t: string) => t === 'BreadcrumbList').length, 1);
  assert.ok(!own.includes('Article'));
  assert.ok(own.includes('BlogPosting'));
});

test("the trail is the site at the language's home, the pages above, the page; the home is the root alone", () => {
  const root = { name: 'Mi sitio', path: '/es' };
  assert.deepEqual(buildBreadcrumbs(root, [{ name: 'Servicios', path: '/es/servicios' }, { name: 'Diseño', path: '/es/servicios/diseno' }], 'https://ex.com'), [
    { name: 'Mi sitio', url: 'https://ex.com/es' },
    { name: 'Servicios', url: 'https://ex.com/es/servicios' },
    { name: 'Diseño', url: 'https://ex.com/es/servicios/diseno' },
  ]);
  // The home's own crumb is the root: no trail to list.
  assert.deepEqual(buildBreadcrumbs(root, [{ name: 'Inicio', path: '/es' }], 'https://ex.com'), [{ name: 'Mi sitio', url: 'https://ex.com/es' }]);
  assert.deepEqual(buildBreadcrumbs({ name: 'X', path: '/' }, [], 'https://ex.com').length, 1);
});

test('a value holding </script> cannot close the tag, and reads back as written', () => {
  const title = 'Tips </script><script>alert(1)</script> & more  ';
  const raw = buildJsonLdGraph({ ...resolved, title, ogTitle: title }, 'https://ex.com/blog', 'https://ex.com', config);
  assert.ok(!/<\/script|<script/i.test(raw));
  assert.ok(!raw.includes('&') && !raw.includes(' '));
  assert.equal(JSON.parse(raw)['@graph'].find((n: any) => n.url === 'https://ex.com/blog').name, title);
});
