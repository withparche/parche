import path from 'node:path';
import { z } from 'zod';
import { siteConfigSchema } from '@parche/astro/config';
import { getDevInfo } from '@parche/astro/dev';
import { session } from '../../server/session.js';
import { json } from '../../server/guard.js';
import { body, handle } from '../../server/http.js';
import { readSite, writeSite } from '../../server/site.js';

const schema = z.toJSONSchema(siteConfigSchema, { unrepresentable: 'any', io: 'input' });

/**
 * The site's identity and its schema. PUT `{ etag, data }` saves it; the dev
 * server restarts to read it (the integration watches the file), so the
 * editor waits for it to come back.
 */
export const GET = handle(async () => {
  const info = getDevInfo();
  const file = info?.siteConfigMode === 'json' ? info.siteConfigPath : null;
  const site = await readSite(file);
  return json({ schema, ...site, relPath: file ? path.relative(session().root, file) : null, mode: info?.siteConfigMode ?? 'inline' });
});

export const PUT = handle(async (req) => {
  const info = getDevInfo();
  const input = await body<{ etag: string; data: unknown }>(req);
  return json(await writeSite(info?.siteConfigMode === 'json' ? info.siteConfigPath : null, input.etag ?? '', input.data, siteConfigSchema));
});
