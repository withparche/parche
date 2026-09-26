import { session, type BuilderEvent } from '../../server/session.js';
import { handle } from '../../server/http.js';

/**
 * Changes on disk, as server-sent events: a document changed or a widget's
 * schema did. Not Vite's HMR, which would reload the editor. The token comes
 * as `?t=`, since EventSource cannot set headers.
 */
export const GET = handle(async (request) => {
  const s = session();
  let send: ((e: BuilderEvent) => void) | undefined;
  let ping: ReturnType<typeof setInterval> | undefined;
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      send = (e) => controller.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`));
      s.listeners.add(send);
      controller.enqueue(enc.encode(': connected\n\n'));
      ping = setInterval(() => controller.enqueue(enc.encode(': ping\n\n')), 25_000);
      request.signal.addEventListener('abort', () => {
        if (send) s.listeners.delete(send);
        clearInterval(ping);
        try {
          controller.close();
        } catch {}
      });
    },
    cancel() {
      if (send) s.listeners.delete(send);
      clearInterval(ping);
    },
  });
  return new Response(stream, { headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' } });
}, { queryToken: true });
