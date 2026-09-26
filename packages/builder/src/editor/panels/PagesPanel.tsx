import { useCallback, useEffect, useMemo, useState } from 'react';
import PanelShell from '../shell/PanelShell';
import { SearchIcon } from '../shell/icons';
import { api, ApiError } from '../api';
import { useUi } from '../store/ui';
import { docKey, isDirty, useDocs } from '../store/documents';

const NONE: string[] = [];

interface Summary {
  id: string;
  format: 'json' | 'md' | 'yaml';
  etag: string;
}

/** The site's pages by locale: open one to edit it; create, rename and delete them. */
export default function PagesPanel() {
  const close = useUi((s) => s.togglePanel);
  const locales = useUi((s) => s.catalog?.i18n.locales) ?? NONE;
  const defaultLocale = useUi((s) => s.catalog?.i18n.defaultLocale ?? 'en');
  const current = useDocs((s) => s.current);
  const docs = useDocs((s) => s.docs);
  const open = useDocs((s) => s.open);
  const [pages, setPages] = useState<Summary[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(() => {
    api<{ docs: Summary[] }>('docs?collection=pages').then((r) => setPages(r.docs), (e: Error) => setError(e.message));
  }, []);
  useEffect(refresh, [refresh]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const by = new Map<string, Summary[]>();
    for (const p of pages) {
      if (q && !p.id.toLowerCase().includes(q)) continue;
      const locale = p.id.includes('/') ? p.id.split('/')[0] : defaultLocale;
      by.set(locale, [...(by.get(locale) ?? []), p]);
    }
    const order = [defaultLocale, ...locales.filter((l) => l !== defaultLocale)];
    return [...by.entries()].sort(([a], [b]) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
  }, [pages, query, locales, defaultLocale]);

  const openPage = (id: string) => void open('pages', id).catch((e: Error) => setError(e.message));

  const rename = async (p: Summary) => {
    const to = prompt('New id (locale/name):', p.id);
    if (!to || to === p.id) return;
    try {
      await api(`doc?collection=pages&id=${encodeURIComponent(p.id)}`, { method: 'PATCH', body: { to, etag: p.etag } });
      useDocs.getState().close(docKey('pages', p.id));
      refresh();
      openPage(to);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const remove = async (p: Summary) => {
    if (!confirm(`Delete ${p.id}? The file goes; git can bring it back.`)) return;
    try {
      await api(`doc?collection=pages&id=${encodeURIComponent(p.id)}`, { method: 'DELETE', body: { etag: p.etag } });
      useDocs.getState().close(docKey('pages', p.id));
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <PanelShell
      title="Pages"
      subtitle={String(pages.length)}
      onClose={() => close('pages')}
      subHeader={
        <div className="flex gap-1.5">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-surface-hover px-2 py-1.5 text-muted focus-within:outline-2 focus-within:outline-ring">
            <SearchIcon size={13} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search pages" aria-label="Search pages" className="min-w-0 flex-1 bg-transparent text-xs text-heading outline-none placeholder:text-muted" />
          </label>
          <button type="button" onClick={() => setCreating(true)} className="shrink-0 rounded-md bg-primary px-2 text-xs font-medium text-on-primary hover:bg-primary-hover">
            New
          </button>
        </div>
      }
    >
      {error && (
        <p role="alert" className="m-3 rounded-md bg-danger-soft p-2 text-xs text-danger">
          {error}
        </p>
      )}
      {creating && <NewPage locales={locales} defaultLocale={defaultLocale} onDone={(id) => { setCreating(false); if (id) { refresh(); openPage(id); } }} />}
      {groups.map(([locale, list]) => (
        <div key={locale} className="px-2 pt-3">
          <h3 className="m-0 px-1 pb-1 text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">{locale}</h3>
          <ul className="m-0 list-none p-0">
            {list.map((p) => {
              const key = docKey('pages', p.id);
              const name = p.id.includes('/') ? p.id.split('/').slice(1).join('/') : p.id;
              return (
                <li key={p.id} className="group flex items-center rounded-md hover:bg-surface-hover aria-[current=true]:bg-primary-soft" aria-current={current === key}>
                  <button type="button" onClick={() => openPage(p.id)} className="flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-left text-xs text-heading">
                    <span className="truncate">{name}</span>
                    {p.format !== 'json' && <span className="rounded bg-surface-2 px-1 text-[9px] text-muted uppercase">{p.format}</span>}
                    {isDirty(docs[key]) && <span className="size-1.5 shrink-0 rounded-full bg-warning" aria-label="unsaved changes" />}
                  </button>
                  <span className="hidden shrink-0 pr-1 group-hover:flex group-focus-within:flex">
                    <button type="button" onClick={() => void rename(p)} className="rounded px-1 text-[10px] text-muted hover:text-heading" aria-label={`Rename ${p.id}`}>
                      Rename
                    </button>
                    <button type="button" onClick={() => void remove(p)} className="rounded px-1 text-[10px] text-muted hover:text-danger" aria-label={`Delete ${p.id}`}>
                      Delete
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </PanelShell>
  );
}

function NewPage({ locales, defaultLocale, onDone }: { locales: string[]; defaultLocale: string; onDone: (id: string | null) => void }) {
  const [locale, setLocale] = useState(defaultLocale);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const create = async () => {
    const id = `${locale}/${name.trim().replace(/^\/+|\/+$/g, '')}`;
    try {
      await api(`doc?collection=pages&id=${encodeURIComponent(id)}`, { method: 'POST', body: { data: { title: title || name, sections: [] } } });
      onDone(id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    }
  };
  const input = 'w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-heading outline-none focus:border-primary';
  return (
    <form className="m-2 flex flex-col gap-2 rounded-md border border-border bg-background p-2.5" onSubmit={(e) => { e.preventDefault(); void create(); }}>
      <div className="flex gap-1.5">
        <select aria-label="Locale" className={`${input} w-16`} value={locale} onChange={(e) => setLocale(e.target.value)}>
          {(locales.length ? locales : [defaultLocale]).map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <input autoFocus className={input} placeholder="name (about, landing/sale)" aria-label="Page name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <input className={input} placeholder="Title" aria-label="Page title" value={title} onChange={(e) => setTitle(e.target.value)} />
      {error && <p className="m-0 text-[11px] text-danger">{error}</p>}
      <div className="flex justify-end gap-1.5">
        <button type="button" onClick={() => onDone(null)} className="rounded-md px-2 py-1 text-xs text-muted hover:text-heading">
          Cancel
        </button>
        <button type="submit" disabled={!name.trim()} className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-on-primary disabled:opacity-40">
          Create
        </button>
      </div>
    </form>
  );
}
