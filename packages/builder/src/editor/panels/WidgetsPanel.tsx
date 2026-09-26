import { useMemo, useState } from 'react';
import PanelShell from '../shell/PanelShell';
import { SearchIcon } from '../shell/icons';
import { useUi } from '../store/ui';
import { useCurrentDoc } from '../store/current';
import { useSelection } from '../store/selection';
import { locate } from '../tree/locate';
import { insertWidget, WIDGET_TYPE } from './OutlinePanel';

/** The site's widgets by category, searchable; hidden ones (Header, Footer, Column) are left out. */
export default function WidgetsPanel() {
  const catalog = useUi((s) => s.catalog);
  const error = useUi((s) => s.catalogError);
  const inspected = useUi((s) => s.inspected);
  const inspect = useUi((s) => s.inspect);
  const close = useUi((s) => s.togglePanel);
  const [query, setQuery] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const doc = useCurrentDoc();
  const selected = useSelection((s) => s.node);

  /** Add a widget to the open document: after the selected node, or at the end of its sections. */
  const add = (name: string) => {
    if (!doc || !catalog) return;
    const at = selected ? locate(doc.kind, doc.data, selected) : null;
    const target = at ? (at.parent ? { parent: at.parent.node.id!, slot: at.parent.slot, index: at.index + 1 } : { root: at.root, index: at.index + 1 }) : { root: doc.kind === 'preset' || doc.kind === 'widget' ? 'tree' : 'sections', index: Number.MAX_SAFE_INTEGER };
    setNote(insertWidget(doc, target, name, catalog));
  };

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byCategory = new Map<string, { name: string; label: string; description?: string }[]>();
    for (const [name, w] of [...Object.entries(catalog?.widgets ?? {}), ...Object.entries(catalog?.jsonWidgets ?? {})] as [string, { label: string; description?: string; category?: string; hidden?: boolean }][]) {
      if (w.hidden) continue;
      // An Outlet belongs in a layout.
      if (name === 'Outlet' && doc?.kind !== 'layout') continue;
      if (q && !`${name} ${w.label} ${w.description ?? ''} ${w.category ?? ''}`.toLowerCase().includes(q)) continue;
      const cat = w.category ?? 'other';
      byCategory.set(cat, [...(byCategory.get(cat) ?? []), { name, label: w.label, description: w.description }]);
    }
    return [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([cat, list]) => [cat, list.sort((a, b) => a.label.localeCompare(b.label))] as const);
  }, [catalog, query, doc?.kind]);
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
      {note && <p role="status" className="m-3 rounded-md bg-warning-soft p-2 text-xs text-heading">{note}</p>}
      {doc && <p className="m-0 px-3 pt-2 text-[11px] text-muted">Drag a widget onto the outline, or use Add to place it {selected ? 'after the selected node' : 'at the end'}.</p>}
      {!catalog && !error && <p className="m-3 text-xs text-muted">Loading the catalog…</p>}
      {groups.map(([cat, list]) => (
        <div key={cat} className="px-2 pt-3">
          <h3 className="m-0 px-1 pb-1 text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">{cat}</h3>
          <ul className="m-0 list-none p-0">
            {list.map((w) => (
              <li key={w.name} className="group relative" draggable={!!doc} onDragStart={(e) => { e.dataTransfer.setData(WIDGET_TYPE, w.name); e.dataTransfer.effectAllowed = 'copy'; }}>
                {doc && (
                  <button type="button" onClick={() => add(w.name)} className="absolute top-1.5 right-1.5 hidden rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-on-primary group-hover:block group-focus-within:block" aria-label={`Add ${w.label}`}>
                    Add
                  </button>
                )}
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
