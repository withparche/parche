import { session } from '../../server/session.js';
import { json } from '../../server/guard.js';
import { listDocs } from '../../server/files.js';
import { handle, param } from '../../server/http.js';

/** The documents of a collection: `?collection=pages`. */
export const GET = handle(async (_req, url) => json({ docs: await listDocs(session().root, param(url, 'collection')) }));
