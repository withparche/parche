import { test } from 'node:test';
import assert from 'node:assert/strict';
import { refuse } from '../src/server/guard.ts';

const s = { token: 'secret', host: false as string | boolean };
const req = (init: { method?: string; headers?: Record<string, string>; url?: string } = {}) =>
  new Request(init.url ?? 'http://localhost:4321/_parche/api/catalog', { method: init.method ?? 'GET', headers: { host: 'localhost:4321', 'x-parche-builder': 'secret', ...init.headers } });

test('the editor\'s own request passes', () => {
  assert.equal(refuse(req(), s), null);
  assert.equal(refuse(req({ headers: { origin: 'http://localhost:4321', 'sec-fetch-site': 'same-origin' } }), s), null);
  assert.equal(refuse(req({ method: 'PUT', headers: { 'content-type': 'application/json' } }), s), null);
});

test('no token, or a wrong one, is refused', () => {
  assert.match(refuse(req({ headers: { 'x-parche-builder': '' } }), s)!, /token/);
  assert.match(refuse(req({ headers: { 'x-parche-builder': 'secreT' } }), s)!, /token/);
  assert.match(refuse(req({ headers: { 'x-parche-builder': 'secret-and-more' } }), s)!, /token/);
});

test('another origin, a cross-site fetch or a foreign host is refused', () => {
  assert.match(refuse(req({ headers: { origin: 'https://evil.example' } }), s)!, /origin/);
  assert.match(refuse(req({ headers: { 'sec-fetch-site': 'cross-site' } }), s)!, /cross-site/);
  assert.match(refuse(req({ headers: { host: 'evil.example:4321' } }), s)!, /host/);
  // Exposed on purpose (--host): the host check steps aside, the token does not.
  assert.equal(refuse(req({ headers: { host: '192.168.1.5:4321' }, url: 'http://192.168.1.5:4321/_parche/api/catalog' }), { ...s, host: '0.0.0.0' }), null);
});

test('a change must be JSON', () => {
  assert.match(refuse(req({ method: 'POST', headers: { 'content-type': 'text/plain' } }), s)!, /application\/json/);
  assert.match(refuse(req({ method: 'DELETE' }), s)!, /application\/json/);
});
