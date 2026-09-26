import { timingSafeEqual } from 'node:crypto';

/**
 * Who may talk to the builder's API. The editor runs on the developer's
 * machine and writes their files, so a request must prove it comes from the
 * editor page this server handed out:
 *
 * - the session token in `x-parche-builder` (from the page's meta tag; a
 *   page on another origin cannot read it);
 * - an `Origin`, when sent, equal to this server's, and no cross-site
 *   `Sec-Fetch-Site`;
 * - a `Host` that is this machine, unless the CLI was told to expose the
 *   server (which blocks DNS rebinding);
 * - JSON on every mutation, which a cross-origin form cannot send without
 *   a preflight nobody approves.
 *
 * Pure: it takes the request and the session, and answers why not.
 */
export interface GuardSession {
  token: string;
  host: string | boolean;
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);
const MUTATIONS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function sameSecret(given: string | null, expected: string): boolean {
  if (!given || !expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * The checks that need no token: this machine, this origin, no cross-site
 * request. Enough for the one kind of request an <img> makes, which cannot
 * carry a header: reading one of the project's own images or icons.
 */
export function refuseForeign(request: Request, s: Pick<GuardSession, 'host'>): string | null {
  const url = new URL(request.url);
  const host = (request.headers.get('host') ?? url.host).replace(/:\d+$/, '');
  if (!s.host && !LOCAL_HOSTS.has(host)) return `host "${host}" is not this machine`;
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return `origin "${origin}" is not this server`;
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') return `cross-site request (${site})`;
  return null;
}

/**
 * Null when the request may proceed, else the reason it may not. The token
 * comes in the header; `queryToken` also accepts it as `?t=` for the one
 * client that cannot set headers and only reads (EventSource).
 */
export function refuse(request: Request, s: GuardSession, opts: { queryToken?: boolean } = {}): string | null {
  const foreign = refuseForeign(request, s);
  if (foreign) return foreign;

  const given = request.headers.get('x-parche-builder') ?? (opts.queryToken && request.method === 'GET' ? new URL(request.url).searchParams.get('t') : null);
  if (!sameSecret(given, s.token)) return 'missing or wrong session token';

  if (MUTATIONS.has(request.method) && !(request.headers.get('content-type') ?? '').startsWith('application/json')) {
    return 'a change must be sent as application/json';
  }
  return null;
}

/** A 403 with the reason, for a route to return when `refuse` answers. */
export function forbidden(reason: string): Response {
  return new Response(JSON.stringify({ error: reason }), { status: 403, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}

/** JSON with the headers every API answer carries. */
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
