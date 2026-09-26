import { session } from './session.js';
import { forbidden, json, refuse, refuseForeign } from './guard.js';
import { FileError } from './files.js';

/**
 * Every API route in one shape: the guard first, then the handler, with a
 * FileError turned into its status and anything else into a 500 that says
 * what happened (this is a local tool: the message helps more than it leaks).
 */
export function handle(fn: (request: Request, url: URL) => Promise<Response>, opts: { image?: (url: URL) => boolean; queryToken?: boolean } = {}) {
  return async ({ request }: { request: Request }) => {
    // An image request (an <img> cannot send the token) only needs to be local and same-origin.
    const url = new URL(request.url);
    const why = request.method === 'GET' && opts.image?.(url) ? refuseForeign(request, session()) : refuse(request, session(), { queryToken: opts.queryToken });
    if (why) return forbidden(why);
    try {
      return await fn(request, url);
    } catch (e) {
      if (e instanceof FileError) return json({ error: e.message, ...(e.detail ? { detail: e.detail } : {}) }, e.status);
      console.error('[parche builder]', e);
      return json({ error: e instanceof Error ? e.message : String(e) }, 500);
    }
  };
}

export async function body<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new FileError(400, 'the body is not JSON');
  }
}

export function param(url: URL, name: string): string {
  const v = url.searchParams.get(name);
  if (!v) throw new FileError(400, `missing "${name}"`);
  return v;
}
