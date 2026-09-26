/**
 * ads.txt: the publisher allowed to sell this site's ad space, from the
 * blog's AdSense `client`. Built only when ads are on with a client.
 */
import type { APIRoute } from 'astro';
import blogConfig from 'parche:app/blog';

export const GET: APIRoute = () => {
  const client = (blogConfig as any).ads?.client as string | undefined;
  const publisher = (client ?? '').replace(/^ca-/, '');
  return new Response(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
