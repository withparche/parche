import { session } from '../../server/session.js';
import { json } from '../../server/guard.js';
import { handle } from '../../server/http.js';
import { iconSvg, searchIcons } from '../../server/icons.js';

/** `?q=arrow&limit=60` searches; `?svg=tabler:home` returns one icon's SVG. */
export const GET = handle(async (_req, url) => {
  const svg = url.searchParams.get('svg');
  if (svg) {
    const body = iconSvg(session().root, svg);
    return body
      ? new Response(body, { headers: { 'content-type': 'image/svg+xml', 'cache-control': 'max-age=3600', 'x-content-type-options': 'nosniff' } })
      : json({ error: `no icon "${svg}"` }, 404);
  }
  return json(searchIcons(session().root, url.searchParams.get('q') ?? '', Number(url.searchParams.get('limit') ?? 60)));
}, { image: (url) => url.searchParams.has('svg') });
