import { expect, test } from '@playwright/test';
import { api, file, token } from './_shared';

test('the API answers only the editor: no token, no entry', async ({ request }) => {
  expect((await request.get('/_parche/api/catalog')).status()).toBe(403);
  expect((await request.get('/_parche/api/doc?collection=pages&id=en/home', { headers: { 'x-parche-builder': 'guess' } })).status()).toBe(403);
});

test('the fixture is valid before any edit', async ({ page, request }) => {
  const a = api(request, await token(page));
  for (const [collection, id] of [['pages', 'en/home'], ['pages', 'en/docs'], ['pages', 'en/about'], ['layouts', 'en/default'], ['layouts', 'en/docs'], ['patterns', 'en/faq'], ['patterns', 'memo']]) {
    const doc = await (await a.get(`doc?collection=${collection}&id=${id}`)).json();
    const res = await (await a.post(`validate?collection=${collection}&id=${id}`, { data: doc.data })).json();
    expect(res.issues, `${collection}/${id}`).toEqual([]);
  }
});

test('paths never leave the content folder; a stale etag is a conflict; a schema error is not saved', async ({ page, request }) => {
  const a = api(request, await token(page));
  expect((await a.get('doc?collection=pages&id=../../package')).status()).toBe(400);
  const doc = await (await a.get('doc?collection=pages&id=en/docs')).json();
  const stale = await a.put('doc?collection=pages&id=en/docs', { etag: 'old', data: doc.data });
  expect(stale.status()).toBe(409);
  const before = file('pages/en/docs.json');
  const bad = await a.put('doc?collection=pages&id=en/docs', { etag: doc.etag, data: { sections: 'nope' } });
  expect(bad.status()).toBe(422);
  expect(file('pages/en/docs.json')).toBe(before);
  const same = await (await a.put('doc?collection=pages&id=en/docs', { etag: doc.etag, data: doc.data })).json();
  expect(same.written).toBe(false);
  expect(file('pages/en/docs.json')).toBe(before);
});
