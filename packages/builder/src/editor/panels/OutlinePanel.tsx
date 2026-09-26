import { useMemo, useState, type DragEvent } from 'react';
import type { Node } from '@parche/astro/content/pure';
import PanelShell from '../shell/PanelShell';
import { useUi } from '../store/ui';
import { useSelection } from '../store/selection';
import { editCurrent, useCurrentDoc } from '../store/current';
import type { Doc } from '../store/documents';
import { rootsOf } from '../../shared/roots';
import { locate, nodeAtPath } from '../tree/locate';
import { canPlace, slotMeta, type Target } from '../tree/rules';
import { duplicateNode, insertNode, moveNode, removeNode } from '../tree/ops';
import { skeleton } from '../tree/skeleton';
import { summaryOf } from '../forms/Form';
import type { Catalog } from '../store/types';

const NODE_TYPE = 'application/x-parche-node';
export const WIDGET_TYPE = 'application/x-parche-widget';

const labelOf = (catalog: Catalog | null, widget: string) => catalog?.widgets[widget]?.label ?? catalog?.jsonWidgets?.[widget]?.label ?? widget;

/** The document as a tree: its lists, each node with its slots, and where things can go. */
export default function OutlinePanel() {
  const close = useUi((s) => s.togglePanel);
  const catalog = useUi((s) => s.catalog);
  const doc = useCurrentDoc();
  const selected = useSelection((s) => s.node);
  const select = useSelection((s) => s.select);

  if (!doc) {
    return (
      <PanelShell title="Outline" onClose={() => close('outline')}>
        <p className="m-3 text-xs text-muted">Open a page to see its outline.</p>
      </PanelShell>
    );
  }

  // A page also fills the named outlets of its layout, through `slots`.
  const roots = rootsOf(doc.kind, doc.data).map((r) => r.base);
  if (doc.kind === 'page' && catalog) {
    const locale = doc.id.includes('/') ? doc.id.split('/')[0] : catalog.i18n.defaultLocale;
    const layoutName = (doc.data.layout as string | undefined) ?? 'default';
    const layout = catalog.layouts.find((l) => l.name === layoutName && l.locale === locale) ?? catalog.layouts.find((l) => l.name === layoutName);
    for (const o of layout?.outlets ?? []) if (o !== 'default' && !roots.includes(`slots.${o}`)) roots.push(`slots.${o}`);
  }
  const errors = doc.issues.filter((i) => i.severity === 'error');

  return (
    <PanelShell title="Outline" subtitle={doc.relPath} onClose={() => close('outline')}>
      <div className="flex min-h-full flex-col">
        <button type="button" onClick={() => select(null)} aria-current={selected === null} className="mx-2 mt-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-heading hover:bg-surface-hover aria-[current=true]:bg-primary-soft">
          {(doc.data.title as string | undefined) ?? (doc.data.label as string | undefined) ?? doc.id}
          <span className="block text-[10px] font-normal text-muted">{doc.kind === 'page' ? 'Page settings' : doc.collection === 'navigation' ? 'Menu: its items are in the inspector' : doc.kind}</span>
        </button>
        {roots.map((base) => (
          <RootList key={base} doc={doc} base={base} />
        ))}
        {errors.length > 0 && (
          <div className="mt-auto border-t border-border p-2" role="region" aria-label="Issues">
            <h3 className="m-0 px-1 pb-1 text-[10px] font-semibold tracking-[0.08em] text-danger uppercase">{errors.length} issue{errors.length === 1 ? '' : 's'}</h3>
            <ul className="m-0 flex max-h-40 list-none flex-col gap-0.5 overflow-auto p-0">
              {errors.map((i, n) => (
                <li key={n}>
                  <button type="button" onClick={() => select(nodeAtPath(doc.kind, doc.data, i.path))} className="w-full rounded px-1 py-0.5 text-left text-[11px] hover:bg-surface-hover">
                    <span className="block font-mono text-[10px] text-muted">{i.path}</span>
                    <span className="text-heading">{i.message}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PanelShell>
  );
}

function RootList({ doc, base }: { doc: Doc; base: string }) {
  const nodes = (base.startsWith('slots.') ? doc.data.slots?.[base.slice(6)] : doc.data[base]) as Node[] | undefined;
  const title = base === 'sections' ? (doc.kind === 'page' ? 'Sections' : 'Tree') : base === 'tree' ? 'Tree' : `Outlet · ${base.slice(6)}`;
  return (
    <section className="mt-2 px-2" aria-label={title}>
      <h3 className="m-0 px-1 pb-0.5 text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">{title}</h3>
      <List doc={doc} nodes={nodes ?? []} at={(index) => ({ root: base, index })} depth={0} />
    </section>
  );
}

function List({ doc, nodes, at, depth }: { doc: Doc; nodes: Node[]; at: (index: number) => Target; depth: number }) {
  return (
    <ul className="m-0 list-none p-0">
      {nodes.map((node, i) => (
        <Row key={node.id ?? i} doc={doc} node={node} index={i} at={at} depth={depth} />
      ))}
      <li>
        <InsertPoint doc={doc} target={at(nodes.length)} depth={depth} />
      </li>
    </ul>
  );
}

function Row({ doc, node, index, at, depth }: { doc: Doc; node: Node; index: number; at: (index: number) => Target; depth: number }) {
  const catalog = useUi((s) => s.catalog);
  const selected = useSelection((s) => s.node);
  const select = useSelection((s) => s.select);
  const [open, setOpen] = useState(true);
  const [drop, setDrop] = useState<'before' | 'after' | null>(null);
  const [refused, setRefused] = useState<string | null>(null);
  const id = node.id!;
  const loc = locate(doc.kind, doc.data, id);
  const declared = Object.keys(catalog?.widgets[node.widget]?.slots ?? {}).filter((s) => s !== '*');
  const wildcard = !!catalog?.widgets[node.widget]?.slots?.['*'];
  const slots = [...new Set([...declared, ...Object.keys(node.slots ?? {})])];
  const summary = summaryOf(node.props);
  const nodeIssues = doc.issues.filter((i) => i.severity === 'error' && loc && (i.path === loc.path || i.path.startsWith(`${loc.path}.props`) || i.path.startsWith(`${loc.path}.wrapper`)));

  const onDragOver = (e: DragEvent) => {
    if (!e.dataTransfer.types.includes(NODE_TYPE) && !e.dataTransfer.types.includes(WIDGET_TYPE)) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    setDrop(e.clientY < r.top + r.height / 2 ? 'before' : 'after');
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const target = at(drop === 'after' ? index + 1 : index);
    setDrop(null);
    const result = placeFromDrop(doc, e, target, catalog);
    setRefused(result);
  };

  return (
    <li>
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(NODE_TYPE, id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragOver={onDragOver}
        onDragLeave={() => setDrop(null)}
        onDrop={onDrop}
        className="group relative flex items-center rounded-md hover:bg-surface-hover aria-[current=true]:bg-primary-soft"
        aria-current={selected === id}
        style={{ paddingLeft: depth * 12 }}
      >
        {drop && <span className={`pointer-events-none absolute inset-x-1 h-0.5 rounded bg-primary ${drop === 'before' ? 'top-0' : 'bottom-0'}`} />}
        <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Collapse' : 'Expand'} className={`grid size-5 shrink-0 place-items-center text-[10px] text-muted ${slots.length || wildcard ? '' : 'invisible'}`}>
          <span className={`inline-block transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
        </button>
        <button type="button" onClick={() => select(id)} className="flex min-w-0 flex-1 items-baseline gap-1.5 py-1 pr-1 text-left">
          <span className="shrink-0 text-xs font-medium text-heading">{labelOf(catalog, node.widget)}</span>
          {summary && <span className="truncate text-[11px] text-muted">{summary}</span>}
          {node.wrapper && typeof node.wrapper === 'object' && <span className="shrink-0 rounded bg-surface-2 px-1 text-[9px] text-muted" title="Has its own wrapper">{(node.wrapper.props?.tone as string) ?? node.wrapper.widget ?? 'band'}</span>}
          {node.wrapper === false && <span className="shrink-0 rounded bg-surface-2 px-1 text-[9px] text-muted">bare</span>}
          {nodeIssues.length > 0 && <span className="shrink-0 rounded-full bg-danger px-1.5 text-[9px] font-semibold text-on-danger" title={nodeIssues.map((i) => i.message).join('\n')}>{nodeIssues.length}</span>}
        </button>
        <span className="hidden shrink-0 items-center pr-1 group-hover:flex group-focus-within:flex">
          <RowButton label="Move up" disabled={index === 0} onClick={() => editCurrent((d) => moveNode(doc.kind, d, id, at(index - 1)))}>↑</RowButton>
          <RowButton label="Move down" disabled={!loc || index >= loc.list.length - 1} onClick={() => editCurrent((d) => moveNode(doc.kind, d, id, at(index + 2)))}>↓</RowButton>
          <RowButton label="Duplicate" onClick={() => editCurrent((d) => void duplicateNode(doc.kind, d, id))}>⧉</RowButton>
          <RowButton label="Delete" danger onClick={() => { editCurrent((d) => void removeNode(doc.kind, d, id)); if (selected === id) select(null); }}>×</RowButton>
        </span>
      </div>
      {refused && (
        <p role="status" className="m-0 px-2 py-1 text-[10px] text-danger" style={{ paddingLeft: depth * 12 + 20 }} onAnimationEnd={() => setRefused(null)}>
          {refused}
        </p>
      )}
      {open && (slots.length > 0 || wildcard) && (
        <div style={{ paddingLeft: depth * 12 + 14 }}>
          {slots.map((slot) => (
            <SlotList key={slot} doc={doc} parent={node} slot={slot} depth={depth + 1} />
          ))}
          {wildcard && <p className="m-0 px-1 py-0.5 text-[10px] text-muted">One slot per option, named by its value.</p>}
        </div>
      )}
    </li>
  );
}

function SlotList({ doc, parent, slot, depth }: { doc: Doc; parent: Node; slot: string; depth: number }) {
  const catalog = useUi((s) => s.catalog);
  const meta = catalog ? slotMeta(catalog, parent.widget, slot) : null;
  const kids = parent.slots?.[slot] ?? [];
  return (
    <div className="border-l border-border pl-1.5">
      <p className="m-0 px-1 pt-1 text-[10px] text-muted" title={meta?.help}>
        <span className="font-mono">{slot}</span>
        {meta?.max !== undefined && <span> · {kids.length}/{meta.max}</span>}
        {meta?.allow && <span> · {meta.allow.join(', ')}</span>}
      </p>
      <List doc={doc} nodes={kids} at={(index) => ({ parent: parent.id!, slot, index })} depth={0} />
    </div>
  );
}

function RowButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: string }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className={`grid size-5 place-items-center rounded text-[11px] text-muted hover:bg-background disabled:opacity-30 ${danger ? 'hover:text-danger' : 'hover:text-heading'}`}>
      {children}
    </button>
  );
}

/** A drop onto a row or an insertion point: a node moves, a widget from the panel is inserted. Returns why not, if it cannot go there. */
function placeFromDrop(doc: Doc, e: DragEvent, target: Target, catalog: Catalog | null): string | null {
  if (!catalog) return null;
  const moving = e.dataTransfer.getData(NODE_TYPE);
  if (moving) {
    const from = locate(doc.kind, doc.data, moving);
    if (!from) return null;
    const ok = canPlace(catalog, doc.kind, doc.data, target, from.node, moving);
    if (!ok.ok) return ok.reason;
    editCurrent((d) => moveNode(doc.kind, d, moving, target));
    return null;
  }
  const widget = e.dataTransfer.getData(WIDGET_TYPE);
  if (widget) return insertWidget(doc, target, widget, catalog);
  return null;
}

export function insertWidget(doc: Doc, target: Target, widget: string, catalog: Catalog): string | null {
  const node = skeleton(catalog, widget);
  const ok = canPlace(catalog, doc.kind, doc.data, target, node);
  if (!ok.ok) return ok.reason;
  editCurrent((d) => insertNode(doc.kind, d, target, node));
  useSelection.getState().select(node.id!);
  return null;
}

/** "+ Add": a searchable list of the widgets that may go here, and nothing else. */
function InsertPoint({ doc, target, depth }: { doc: Doc; target: Target; depth: number }) {
  const catalog = useUi((s) => s.catalog);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [over, setOver] = useState(false);
  const [refused, setRefused] = useState<string | null>(null);
  const options = useMemo(() => {
    if (!open || !catalog) return [];
    const q = query.trim().toLowerCase();
    const all = [...Object.entries(catalog.widgets).filter(([, w]) => !w.hidden || 'parent' in target), ...Object.entries(catalog.jsonWidgets ?? {})];
    return all
      .filter(([name, w]) => !q || `${name} ${w.label}`.toLowerCase().includes(q))
      .filter(([name]) => canPlace(catalog, doc.kind, doc.data, target, skeleton(catalog, name)).ok)
      .map(([name, w]) => ({ name, label: w.label, category: w.category }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [open, catalog, query, doc, target]);
  if (doc.readOnly) return null;
  return (
    <div
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(NODE_TYPE) || e.dataTransfer.types.includes(WIDGET_TYPE)) {
          e.preventDefault();
          setOver(true);
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        setRefused(placeFromDrop(doc, e, target, catalog));
      }}
      style={{ paddingLeft: depth * 12 }}
    >
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className={`w-full rounded px-2 py-0.5 text-left text-[11px] text-muted hover:bg-surface-hover hover:text-primary ${over ? 'bg-primary-soft text-primary' : ''}`}>
          + Add
        </button>
      ) : (
        <div className="my-1 rounded-md border border-border bg-background p-1.5">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false);
              if (e.key === 'Enter' && options[0] && catalog) {
                setRefused(insertWidget(doc, target, options[0].name, catalog));
                setOpen(false);
              }
            }}
            placeholder="Widget to add…"
            aria-label="Widget to add"
            className="w-full rounded border border-border bg-surface px-1.5 py-1 text-xs text-heading outline-none focus:border-primary"
          />
          <ul className="m-0 mt-1 max-h-48 list-none overflow-auto p-0">
            {options.map((o) => (
              <li key={o.name}>
                <button type="button" onClick={() => { if (catalog) setRefused(insertWidget(doc, target, o.name, catalog)); setOpen(false); setQuery(''); }} className="flex w-full items-baseline gap-1.5 rounded px-1.5 py-1 text-left hover:bg-surface-hover">
                  <span className="text-xs text-heading">{o.label}</span>
                  <span className="text-[10px] text-muted">{o.category}</span>
                </button>
              </li>
            ))}
            {options.length === 0 && <li className="px-1.5 py-1 text-[11px] text-muted">Nothing fits here.</li>}
          </ul>
          <button type="button" onClick={() => setOpen(false)} className="mt-1 text-[10px] text-muted hover:text-heading">
            Cancel
          </button>
        </div>
      )}
      {refused && <p role="status" className="m-0 px-2 text-[10px] text-danger">{refused}</p>}
    </div>
  );
}
