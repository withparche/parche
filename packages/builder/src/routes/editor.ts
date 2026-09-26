import type { APIRoute } from 'astro';
import { session } from '../server/session.js';

/**
 * The editor's page: an empty shell that loads the prebuilt React bundle.
 * It is not an Astro page with an island on purpose — Astro reloads every
 * page it serves when content changes, and the editor saves content.
 * The session token rides in a meta tag, readable only by same-origin code.
 */
export const GET: APIRoute = ({ request }) => {
  const s = session();
  const host = (request.headers.get('host') ?? '').replace(/:\d+$/, '');
  if (!s.host && !['localhost', '127.0.0.1', '[::1]', '::1'].includes(host)) {
    return new Response('The builder only answers on this machine.', { status: 403 });
  }
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="parche-builder-token" content="${s.token}">
<meta name="parche-builder-preview-token" content="${s.previewToken}">
<title>Parche builder</title>
<link rel="stylesheet" href="/_parche/builder/assets/editor.css">
</head>
<body>
<div id="parche-builder"></div>
<script type="module" src="/_parche/builder/assets/editor.js"></script>
</body>
</html>`;
  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      // The editor frames the site's own pages; nothing may frame the editor.
      'content-security-policy': "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; frame-src 'self'; frame-ancestors 'none'",
    },
  });
};
