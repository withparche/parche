import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

/** The editor's prebuilt files, by name: nothing else is ever served from here. */
const FILES: Record<string, string> = {
  'editor.js': 'text/javascript; charset=utf-8',
  'editor.css': 'text/css; charset=utf-8',
  'preview-client.js': 'text/javascript; charset=utf-8',
};

export const GET: APIRoute = async ({ params }) => {
  const name = params.file ?? '';
  const type = FILES[name];
  if (!type) return new Response('Not found', { status: 404 });
  try {
    const body = await readFile(fileURLToPath(new URL(`../../dist/editor/${name}`, import.meta.url)));
    return new Response(body, { headers: { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
  } catch {
    return new Response(`The editor is not built: run \`pnpm --filter @parche/builder build\` (missing dist/editor/${name}).`, { status: 503 });
  }
};
