import type { IncomingMessage, ServerResponse } from 'node:http';
import { session } from './session.js';
import { previewAls } from './preview.js';

/**
 * The preview, as a middleware of the dev server itself: a request for
 * `/_parche/preview/<token>/<page>` becomes a request for `<page>`, and Astro
 * handles it inside the preview context — the editor's drafts stand in for
 * their files, and nodes mark themselves. A prerendered page gets no query,
 * headers or cookies in dev and Astro may not hand an on-demand route to a
 * prerendered one, so the path, read here before Astro, is the channel.
 * Every other request passes untouched and never sees a draft.
 */
const PREFIX = /^\/_parche\/preview\/([^/?]+)(\/[^?]*)?(\?.*)?$/;

export function previewMiddleware(req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void): void {
  const m = PREFIX.exec(req.url ?? '');
  if (!m) return next();
  const s = session();
  if (!s.previewToken || m[1] !== s.previewToken) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }
  req.url = (m[2] || '/') + (m[3] ?? '');
  res.setHeader('cache-control', 'no-store');
  previewAls().run({ drafts: s.drafts, markers: true }, () => next());
}
