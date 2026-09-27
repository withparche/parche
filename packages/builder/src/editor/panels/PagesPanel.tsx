import { useCallback, useEffect, useMemo, useState } from 'react';
import PanelShell from '../shell/PanelShell';
import { SearchIcon } from '../shell/icons';
import { api, ApiError } from '../api';
import { useUi } from '../store/ui';
import { docKey, isDirty, useDocs } from '../store/documents';
import { skeleton } from '../tree/skeleton';
import { patternFrom } from '../tree/pattern-ops';
import type { Catalog } from '../store/types';

const NONE: string[] = [];

interface Summary {
  id: string;
  format: 'json' | 'md' | 'yaml';
  etag: string;
}

/** The collections the builder edits as documents, with what a new one starts as (none: made elsewhere). */
/** What a new document of a collection is asked for besides its name. */
const humanTitle = (collection: string) => ({ pages: 'Title', posts: 'Title', series: 'Title', authors: 'Name' } as Record<string, string>)[collection] ?? 'Label';

const today = () => new Date().toISOString().slice(0, 10);

const COLLECTIONS: { id: string; label: string; one: string; create?: (title: string) => Record<string, unknown>; format?: 'md'; blog?: true }[] = [
  { id: 'pages', label: 'Pages', one: 'page', create: (title) => ({ title, sections: [] }) },
  { id: 'layouts', label: 'Layouts', one: 'layout', create: () => ({ sections: [{ widget: 'Outlet' }] }) },
  { id: 'navigation', label: 'Menus', one: 'menu', create: (title) => ({ label: title, items: [] }) },
  // A pattern starts from a widget the person picks (NewPattern), never empty.
  { id: 'patterns', label: 'Patterns', one: 'pattern', create: () => ({}) },
  // The blog's, when the site has it. A new post starts as a draft dated today.
  { id: 'posts', label: 'Posts', one: 'post', create: (title) => ({ title, publishDate: today(), draft: true }), format: 'md', blog: true },
  { id: 'views', label: 'Blog views', one: 'view', blog: true },
  { id: 'authors', label: 'Authors', one: 'author', create: (title) => ({ name: title }), blog: true },
  { id: 'series', label: 'Series', one: 'series', create: (title) => ({ title }), blog: true },
  { id: 'taxonomies', label: 'Taxonomies', one: 'taxonomy', blog: true },
];

/**
 * The site's documents by locale — pages, layouts, menus and patterns:
 * open one to edit it; create, rename and delete them.
 */
export default function PagesPanel() {
  const close = useUi((s) => s.togglePanel);
  const locales = useUi((s) => s.catalog?.i18n.locales) ?? NONE;
  const defaultLocale = useUi((s) => s.catalog?.i18n.defaultLocale ?? 'en');
  const current = useDocs((s) => s.current);
  const docs = useDocs((s) => s.docs);
  const open = useDocs((s) => s.open);
  const collection = useUi((s) => s.docsCollection);
  const setCollection = useUi((s) => s.setDocsCollection);
  const hasBlog = useUi((s) => !!s.catalog?.blog);
  const offered = COLLECTIONS.filter((c) => !c.blog || hasBlog);
  const coll = offered.find((c) => c.id === collection) ?? offered[0];
  const [pages, setPages] = useState<Summary[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(() => {
    setError(null);
    api<{ docs: Summary[] }>(`docs?collection=${collection}`).then((r) => setPages(r.docs), (e: Error) => setError(e.message));
  }, [collection]);
  useEffect(refresh, [refresh]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const by = new Map<string, Summary[]>();
    for (const p of pages) {
      if (q && !p.id.toLowerCase().includes(q)) continue;
      // A page without a locale folder is the default locale's; a pattern or a menu serves every language.
      const locale = p.id.includes('/') && locales.includes(p.id.split('/')[0]) ? p.id.split('/')[0] : collection === 'pages' ? defaultLocale : 'every language';
      by.set(locale, [...(by.get(locale) ?? []), p]);
    }
    const order = [defaultLocale, ...locales.filter((l) => l !== defaultLocale)];
    return [...by.entries()].sort(([a], [b]) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
  }, [pages, query, locales, defaultLocale, collection]);

  const openPage = (id: string) => void open(collection, id).catch((e: Error) => setError(e.message));

  const rename = async (p: Summary) => {
    const to = prompt('New id (locale/name):', p.id);
    if (!to || to === p.id) return;
    try {
      await api(`doc?collection=${collection}&id=${encodeURIComponent(p.id)}`, { method: 'PATCH', body: { to, etag: p.etag } });
      useDocs.getState().close(docKey(collection, p.id));
      refresh();
      openPage(to);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const remove = async (p: Summary) => {
    if (!confirm(`Delete ${p.id}? The file goes; git can bring it back.`)) return;
    try {
      await api(`doc?collection=${collection}&id=${encodeURIComponent(p.id)}`, { method: 'DELETE', body: { etag: p.etag } });
      useDocs.getState().close(docKey(collection, p.id));
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <PanelShell
      title={coll.label}
      subtitle={String(pages.length)}
      onClose={() => close('pages')}
      subHeader={
        <div className="flex flex-col gap-1.5">
        <select aria-label="Documents" value={collection} onChange={(e) => { setCollection(e.target.value); setCreating(false); setQuery(''); }} className="rounded-md border border-border bg-background px-1.5 py-1 text-xs text-heading">
          {offered.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <div className="flex gap-1.5">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-surface-hover px-2 py-1.5 text-muted focus-within:outline-2 focus-within:outline-ring">
            <SearchIcon size={13} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${coll.label.toLowerCase()}`} aria-label={`Search ${coll.label.toLowerCase()}`} className="min-w-0 flex-1 bg-transparent text-xs text-heading outline-none placeholder:text-muted" />
          </label>
          {coll.create && (
            <button type="button" onClick={() => setCreating(true)} className="shrink-0 rounded-md bg-primary px-2 text-xs font-medium text-on-primary hover:bg-primary-hover">
              New
            </button>
          )}
        </div>
        </div>
      }
    >
      {error && (
        <p role="alert" className="m-3 rounded-md bg-danger-soft p-2 text-xs text-danger">
          {error}
        </p>
      )}
      {creating && collection === 'patterns' && <NewPattern locales={locales} onDone={(id) => { setCreating(false); if (id) { refresh(); openPage(id); } }} />}
      {creating && coll.create && collection !== 'patterns' && <NewPage collection={collection} one={coll.one} make={coll.create} format={coll.format} locales={locales} defaultLocale={defaultLocale} onDone={(id) => { setCreating(false); if (id) { refresh(); openPage(id); } }} />}
      {collection === 'views' && <BlogViews docs={pages} onOpen={openPage} onCreated={(id) => { refresh(); openPage(id); }} />}
      {collection !== 'views' && groups.map(([locale, list]) => (
        <div key={locale} className="px-2 pt-3">
          <h3 className="m-0 px-1 pb-1 text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">{locale}</h3>
          <ul className="m-0 list-none p-0">
            {list.map((p) => {
              const key = docKey(collection, p.id);
              const name = p.id.includes('/') && locales.includes(p.id.split('/')[0]) ? p.id.split('/').slice(1).join('/') : p.id;
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

function NewPage({ collection, one, make, format, locales, defaultLocale, onDone }: { collection: string; one: string; make: (title: string) => Record<string, unknown>; format?: 'md'; locales: string[]; defaultLocale: string; onDone: (id: string | null) => void }) {
  const [locale, setLocale] = useState(defaultLocale);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const create = async () => {
    const id = `${locale}/${name.trim().replace(/^\/+|\/+$/g, '')}`;
    try {
      await api(`doc?collection=${collection}&id=${encodeURIComponent(id)}`, { method: 'POST', body: { data: make(title || name), ...(format ? { format, body: '' } : {}) } });
      // Where it shows (a post's address) and what uses it are in the catalog.
      await api<Catalog>('catalog').then(useUi.getState().setCatalog, () => undefined);
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
        <input autoFocus className={input} placeholder={collection === 'pages' ? 'name (about, landing/sale)' : 'name'} aria-label={`New ${one} name`} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      {collection !== 'layouts' && <input className={input} placeholder={humanTitle(collection)} aria-label={`New ${one} ${humanTitle(collection).toLowerCase()}`} value={title} onChange={(e) => setTitle(e.target.value)} />}
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

/** A new pattern: its label, its name, the languages it serves, and the widget it starts from. */
function NewPattern({ locales, onDone }: { locales: string[]; onDone: (id: string | null) => void }) {
  const catalog = useUi((s) => s.catalog);
  const [label, setLabel] = useState('');
  const [name, setName] = useState('');
  const [scope, setScope] = useState('');
  const [widget, setWidget] = useState('');
  const [error, setError] = useState<string | null>(null);
  const widgets = Object.entries(catalog?.widgets ?? {}).filter(([n, w]) => !w.hidden && n !== 'Outlet').sort(([, a], [, b]) => a.label.localeCompare(b.label));
  const slug = (name || label).trim().toLowerCase().replace(/[^a-z0-9/-]+/g, '-').replace(/^-+|-+$/g, '');
  const create = async () => {
    if (!catalog || !slug || !widget) return;
    const id = scope ? `${scope}/${slug}` : slug;
    try {
      await api(`doc?collection=patterns&id=${encodeURIComponent(id)}`, { method: 'POST', body: { data: patternFrom([skeleton(catalog, widget)], label || slug) } });
      await api<Catalog>('catalog').then(useUi.getState().setCatalog, () => undefined);
      onDone(id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    }
  };
  const input = 'w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-heading outline-none focus:border-primary';
  return (
    <form className="m-2 flex flex-col gap-2 rounded-md border border-border bg-background p-2.5" onSubmit={(e) => { e.preventDefault(); void create(); }}>
      <input autoFocus className={input} placeholder="Label (Product page, Common questions)" aria-label="New pattern label" value={label} onChange={(e) => setLabel(e.target.value)} />
      <div className="flex gap-1.5">
        <input className={input} placeholder={slug || 'name'} aria-label="New pattern name" value={name} onChange={(e) => setName(e.target.value)} />
        <select className={`${input} w-auto`} aria-label="Languages" value={scope} onChange={(e) => setScope(e.target.value)}>
          <option value="">Every language</option>
          {locales.map((l) => (
            <option key={l} value={l}>
              Only {l}
            </option>
          ))}
        </select>
      </div>
      <select className={input} aria-label="Starts from" value={widget} onChange={(e) => setWidget(e.target.value)}>
        <option value="">Starts from…</option>
        {widgets.map(([n, w]) => (
          <option key={n} value={n}>
            {w.label}
          </option>
        ))}
      </select>
      <p className="m-0 text-[10px] text-muted">Add more widgets in the outline; give it props by linking fields to them.</p>
      {error && <p className="m-0 text-[11px] text-danger">{error}</p>}
      <div className="flex justify-end gap-1.5">
        <button type="button" onClick={() => onDone(null)} className="rounded-md px-2 py-1 text-xs text-muted hover:text-heading">
          Cancel
        </button>
        <button type="submit" disabled={!slug || !widget} className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-on-primary disabled:opacity-40">
          Create
        </button>
      </div>
    </form>
  );
}

/**
 * The blog's views: each page type the preset renders (index, post, author…).
 * One the site has not customised shows the preset's; "Customize" copies it
 * into the site (`views/blog-<name>.json`), where the outline edits it.
 * Deleting that copy goes back to the preset's.
 */
function BlogViews({ docs, onOpen, onCreated }: { docs: Summary[]; onOpen: (id: string) => void; onCreated: (id: string) => void }) {
  const blog = useUi((s) => s.catalog?.blog);
  const [error, setError] = useState<string | null>(null);
  if (!blog) return null;
  const customize = async (name: string, view: { sections: unknown[]; wrapper?: unknown }) => {
    try {
      await api(`doc?collection=views&id=${encodeURIComponent(`blog-${name}`)}`, { method: 'POST', body: { data: view } });
      onCreated(`blog-${name}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  return (
    <div className="px-2 pt-3">
      <p className="m-0 px-1 pb-2 text-[11px] text-muted">
        The pages the <span className="font-mono">{blog.preset}</span> preset renders. Customize one to edit it for this site.
      </p>
      {error && <p role="alert" className="m-1 text-[11px] text-danger">{error}</p>}
      <ul className="m-0 list-none p-0">
        {blog.views.map((v) => {
          const own = docs.filter((d) => d.id === `blog-${v.name}` || d.id.endsWith(`/blog-${v.name}`));
          return (
            <li key={v.name} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-surface-hover">
              <span className="flex-1 text-xs text-heading">{v.name}</span>
              {own.length ? (
                own.map((d) => (
                  <button key={d.id} type="button" onClick={() => onOpen(d.id)} className="rounded px-1.5 text-[11px] text-primary hover:underline" aria-label={`Open ${d.id}`}>
                    {d.id.includes('/') ? d.id.split('/')[0] : 'Open'}
                  </button>
                ))
              ) : (
                <button type="button" onClick={() => void customize(v.name, v.preset)} className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted hover:text-heading" aria-label={`Customize ${v.name}`}>
                  Customize
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
