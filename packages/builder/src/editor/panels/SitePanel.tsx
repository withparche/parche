import { useEffect, useState } from 'react';
import PanelShell from '../shell/PanelShell';
import Form, { type Pointer } from '../forms/Form';
import { api, ApiError } from '../api';
import { useUi } from '../store/ui';
import { setIn } from '../tree/ops';
import type { Catalog } from '../store/types';

interface Site {
  schema: Record<string, unknown>;
  data: Record<string, unknown>;
  etag: string;
  relPath: string | null;
  readOnly: boolean;
  mode: 'json' | 'inline';
}

/**
 * The site's identity: its URL, brand, SEO defaults, analytics — the site
 * config file, as core's schema describes it. Astro reads it once, at
 * startup: a save restarts the dev server, and the editor waits for it.
 * A site that declares its identity in astro.config is shown, not written.
 */
export default function SitePanel() {
  const close = useUi((s) => s.togglePanel);
  const [site, setSite] = useState<Site | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'restarting'>('idle');
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    api<Site>('site').then(
      (s) => {
        setSite(s);
        setDraft(structuredClone(s.data));
      },
      (e: Error) => setError(e.message),
    );
  useEffect(() => void load(), []);

  const dirty = !!site && !!draft && JSON.stringify(site.data) !== JSON.stringify(draft);
  const onChange = (pointer: Pointer, value: unknown) =>
    setDraft((d) => {
      const next = structuredClone(d ?? {});
      if (pointer.length === 0) return (value as Record<string, unknown>) ?? {};
      setIn(next, pointer, value);
      return next;
    });

  const save = async () => {
    if (!site || !draft) return;
    setStatus('saving');
    setError(null);
    try {
      await api('site', { method: 'PUT', body: { etag: site.etag, data: draft } });
    } catch (e) {
      const detail = e instanceof ApiError ? (e.body as { issues?: { path: string; message: string }[] }) : null;
      setError(detail?.issues?.length ? detail.issues.map((i) => `${i.path}: ${i.message}`).join('\n') : (e as Error).message);
      setStatus('idle');
      return;
    }
    // The server restarts to read it: wait until it answers again.
    setStatus('restarting');
    await waitForRestart();
    await load();
    const ui = useUi.getState();
    await api<Catalog>('catalog').then(ui.setCatalog, () => undefined);
    ui.bumpPreview();
    setStatus('idle');
  };

  return (
    <PanelShell title="Site" subtitle={site?.relPath ?? undefined} onClose={() => close('site')}>
      {!site && !error && <p className="m-3 text-xs text-muted">Loading the site config…</p>}
      {site?.readOnly && (
        <p className="m-3 rounded-md bg-surface-2 p-2 text-[11px] text-muted">
          {site.mode === 'inline' ? "This site declares its identity in astro.config (parche({ … })): edit it there. The builder edits a JSON site config." : 'The site config is not a JSON file: the builder shows it but does not write it.'}
        </p>
      )}
      {site && !site.readOnly && draft && (
        <fieldset disabled={status !== 'idle'} className="m-0 border-0 p-0">
          <Form schema={site.schema} value={draft} onChange={onChange} scope="site" />
        </fieldset>
      )}
      {site && !site.readOnly && (
        <div className="sticky bottom-0 flex items-center gap-2 border-t border-border bg-surface p-2">
          {error ? (
            <span role="alert" className="min-w-0 flex-1 text-[11px] whitespace-pre-line text-danger">
              {error}
            </span>
          ) : (
            <span role="status" className="flex-1 text-[11px] text-muted">
              {status === 'restarting' ? 'Restarting the dev server…' : dirty ? 'Saving restarts the dev server' : 'Saved'}
            </span>
          )}
          <button type="button" disabled={!dirty || status !== 'idle'} onClick={() => setDraft(structuredClone(site.data))} className="rounded-md px-2 py-1 text-xs text-muted hover:text-heading disabled:opacity-40">
            Discard
          </button>
          <button type="button" disabled={!dirty || status !== 'idle'} onClick={() => void save()} className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-on-primary disabled:bg-surface-hover disabled:text-muted">
            {status === 'saving' ? 'Saving…' : 'Save site'}
          </button>
        </div>
      )}
      <BlogOptions />
      {!site && error && (
        <p role="alert" className="m-3 text-xs text-danger">
          {error}
        </p>
      )}
    </PanelShell>
  );
}

/**
 * Wait for the dev server to come back after it restarts: it goes away for
 * a moment (or answers from the old instance first), so wait a beat, then
 * until the catalog answers twice in a row.
 */
async function waitForRestart(timeout = 60_000) {
  const until = Date.now() + timeout;
  const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
  await pause(800);
  let ok = 0;
  while (Date.now() < until && ok < 2) {
    try {
      await api('catalog');
      ok++;
    } catch {
      ok = 0;
    }
    await pause(400);
  }
}

/** The blog's options, when the site has it: set in astro.config (`createBlog({ … })`), shown here, not written. */
function BlogOptions() {
  const blog = useUi((s) => s.catalog?.blog);
  if (!blog) return null;
  const c = blog.config as Record<string, any>;
  const rows: [string, string][] = [
    ['Preset', String(c.preset)],
    ['Post URL', String(c.permalinks?.post)],
    ['Listing', String(c.permalinks?.listing)],
    ['Writers', c.authors === 'one' ? 'One' : 'Several'],
    ['Table of contents', c.toc ? 'On' : 'Off'],
    ['Series', c.series ? 'On' : 'Off'],
    ['Archive', c.archive ? String(c.permalinks?.archive) : 'Off'],
    ['Subscribe', c.subscribe ? String(c.subscribe.path) : 'Off'],
    ['Feed', c.rss ? String(c.permalinks?.rss) : 'Off'],
  ];
  return (
    <section aria-label="Blog options" className="border-t border-border p-3">
      <h3 className="m-0 pb-1 text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">Blog</h3>
      <p className="m-0 pb-2 text-[11px] text-muted">Set in astro.config, in createBlog({'{ … }'}): shown here, not edited.</p>
      <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{k}</dt>
            <dd className="m-0 truncate font-mono text-heading">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
