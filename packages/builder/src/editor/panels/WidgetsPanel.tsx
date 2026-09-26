import { useMemo, useState } from 'react';
import PanelShell from '../shell/PanelShell';
import { SearchIcon } from '../shell/icons';
import { useUi } from '../store/ui';

/** The site's widgets by category, searchable; hidden ones (Header, Footer, Column) are left out. */
export default function WidgetsPanel() {
  const catalog = useUi((s) => s.catalog);
  const error = useUi((s) => s.catalogError);
  const inspected = useUi((s) => s.inspected);
  const inspect = useUi((s) => s.inspect);
  const close = useUi((s) => s.togglePanel);
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byCategory = new Map<string, { name: string; label: string; description?: string }[]>();
    for (const [name, w] of Object.entries(catalog?.widgets ?? {})) {
      if (w.hidden) continue;
      if (q && !`${name} ${w.label} ${w.description ?? ''} ${w.category ?? ''}`.toLowerCase().includes(q)) continue;
      const cat = w.category ?? 'other';
      byCategory.set(cat, [...(byCategory.get(cat) ?? []), { name, label: w.label, description: w.description }]);
    }
    return [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([cat, list]) => [cat, list.sort((a, b) => a.label.localeCompare(b.label))] as const);
  }, [catalog, query]);
  const count = groups.reduce((n, [, l]) => n + l.length, 0);

  return (
    <PanelShell
      title="Widgets"
      subtitle={catalog ? String(count) : undefined}
      onClose={() => close('widgets')}
      subHeader={
        <label className="flex items-center gap-2 rounded-md bg-surface-hover px-2 py-1.5 text-muted focus-within:outline-2 focus-within:outline-ring">
          <SearchIcon size={13} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search widgets" aria-label="Search widgets" className="min-w-0 flex-1 bg-transparent text-xs text-heading outline-none placeholder:text-muted" />
        </label>
      }
    >
      {error && <p className="m-3 rounded-md bg-danger-soft p-2 text-xs text-danger">{error}</p>}
      {!catalog && !error && <p className="m-3 text-xs text-muted">Loading the catalog…</p>}
      {groups.map(([cat, list]) => (
        <div key={cat} className="px-2 pt-3">
          <h3 className="m-0 px-1 pb-1 text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">{cat}</h3>
          <ul className="m-0 list-none p-0">
            {list.map((w) => (
              <li key={w.name}>
                <button
                  type="button"
                  onClick={() => inspect(w.name)}
                  aria-current={inspected === w.name}
                  className="w-full rounded-md px-2 py-1.5 text-left hover:bg-surface-hover aria-[current=true]:bg-primary-soft"
                >
                  <span className="block text-xs font-medium text-heading">{w.label}</span>
                  {w.description && <span className="line-clamp-2 block text-[11px] leading-snug text-muted">{w.description}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </PanelShell>
  );
}
