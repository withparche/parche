import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { session } from '../../server/session.js';
import { json } from '../../server/guard.js';
import { handle } from '../../server/http.js';
import { assetFile, listAssets } from '../../server/assets.js';

const TYPES: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif' };

/** The site's images: the list, or one file with `?value=@/assets/images/x.png`. */
export const GET = handle(async (_req, url) => {
  const value = url.searchParams.get('value');
  if (!value) return json({ assets: listAssets(session().root) });
  const file = assetFile(session().root, value);
  if (!file) return json({ error: `no asset "${value}"` }, 404);
  return new Response(await readFile(file), {
    headers: { 'content-type': TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream', 'x-content-type-options': 'nosniff', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'", 'cache-control': 'no-store' },
  });
}, { image: (url) => url.searchParams.has('value') });
