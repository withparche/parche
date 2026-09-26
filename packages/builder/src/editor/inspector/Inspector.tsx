import { useState } from 'react';
import type { WrapperSpec } from '@parche/astro/content/pure';
import PanelShell from '../shell/PanelShell';
import Form, { type Pointer } from '../forms/Form';
import { useUi } from '../store/ui';
import { useSelection } from '../store/selection';
import { editCurrent, useCurrentDoc } from '../store/current';
import type { Doc } from '../store/documents';
import { locate } from '../tree/locate';
import { setIn, setProp, setWrapper } from '../tree/ops';
import WidgetInfo from './WidgetInfo';
import { pagesShowing } from '../preview/through';

/**
 * The right panel: the selected node's props, its wrapper and its issues;
 * or, with nothing selected, the document's settings. A widget picked in
 * the catalog (not in the page) shows its description instead.
 */
export default function Inspector() {
  const doc = useCurrentDoc();
  const node = useSelection((s) => s.node);
  const inspected = useUi((s) => s.inspected);
  if (inspected) return <WidgetInfo />;
  if (!doc) return null;
  const at = node ? locate(doc.kind, doc.data, node) : null;
  if (at) return <NodeInspector doc={doc} id={node!} />;
  return <DocSettings doc={doc} />;
}

function NodeInspector({ doc, id }: { doc: Doc; id: string }) {
  const catalog = useUi((s) => s.catalog);
  const select = useSelection((s) => s.select);
  const at = locate(doc.kind, doc.data, id)!;
  const widget = catalog?.widgets[at.node.widget] ?? catalog?.jsonWidgets?.[at.node.widget];
  const schema = widget?.schema as Record<string, unknown> | undefined;
  const issues = doc.issues.filter((i) => i.path === at.path || i.path.startsWith(`${at.path}.props`) || i.path.startsWith(`${at.path}.wrapper`));
  const onChange = (pointer: Pointer, value: unknown, group?: string) => editCurrent((d) => setProp(doc.kind, d, id, pointer, value), group);
  // A list's item may carry its own wrapper; a node inside a slot is never wrapped by its list, but may ask.
  const outlet = at.node.widget === 'Outlet';
  // Two outlets of one name would take the same slot of the page.
  const name = (at.node.props?.name as string | undefined) || 'default';
  const twin = outlet && outletNames(doc).filter((n) => n === name).length > 1;
  return (
    <PanelShell title={widget?.label ?? at.node.widget} subtitle={at.path} onClose={() => select(null)}>
      {issues.length > 0 && (
        <ul role="alert" className="m-2 flex list-none flex-col gap-1 rounded-md bg-danger-soft p-2">
          {issues.map((i, n) => (
            <li key={n} className="text-[11px] text-danger">
              <span className="font-mono">{i.path.slice(at.path.length + 1) || 'node'}</span>: {i.message}
            </li>
          ))}
        </ul>
      )}
      {!widget && <p className="m-3 text-xs text-warning">"{at.node.widget}" is not a widget this site registers.</p>}
      {widget && !schema && <p className="m-3 text-xs text-muted">This widget declares no props.</p>}
      {schema && <Form key={id} schema={schema} value={at.node.props} onChange={onChange} groups={(widget as { ui?: { groups?: never } })?.ui?.groups} scope={id} />}
      {twin && (
        <p role="alert" className="m-2 rounded-md bg-danger-soft p-2 text-[11px] text-danger">
          Another Outlet of this layout is also "{name}": each name takes one slot of the page.
        </p>
      )}
      {outlet && (
        <p className="mx-3 mt-0 mb-2 text-[11px] text-muted">
          {name === 'default' ? "Takes the page's sections." : <>Takes what a page puts in its <span className="font-mono">{name}</span> slot.</>}
        </p>
      )}
      {outlet ? <OutletWrapperEditor doc={doc} id={id} /> : <WrapperEditor doc={doc} id={id} />}
    </PanelShell>
  );
}

/** How this node is wrapped: as its list says, not at all, or in a wrapper of its own (Section by default). */
function WrapperEditor({ doc, id }: { doc: Doc; id: string }) {
  const at = locate(doc.kind, doc.data, id)!;
  const spec = at.node.wrapper as WrapperSpec | undefined;
  return (
    <WrapperFields
      title="Wrapper"
      spec={spec}
      modes={[
        ['inherit', 'From the list', undefined],
        ['none', 'None', false],
        ['own', 'Its own', {}],
      ]}
      scope={`${id}:wrapper`}
      set={(next) => editCurrent((d) => setWrapper(doc.kind, d, id, next))}
      edit={(recipe, group) =>
        editCurrent((d) => {
          const node = locate(doc.kind, d, id)?.node;
          if (node?.wrapper && typeof node.wrapper === 'object') recipe(node.wrapper);
        }, group)
      }
    />
  );
}

/**
 * The wrapper every item of an Outlet's list goes in: none, or a widget
 * (Section by default) with the props the items share. An item may still
 * say its own on itself.
 */
function OutletWrapperEditor({ doc, id }: { doc: Doc; id: string }) {
  const at = locate(doc.kind, doc.data, id)!;
  const spec = at.node.props?.wrapper as WrapperSpec | undefined;
  return (
    <WrapperFields
      title="Wraps each item in"
      spec={spec}
      modes={[
        ['none', 'Nothing', undefined],
        ['own', 'A wrapper', {}],
      ]}
      scope={`${id}:outlet-wrapper`}
      set={(next) => editCurrent((d) => setProp(doc.kind, d, id, ['wrapper'], next))}
      edit={(recipe, group) =>
        editCurrent((d) => {
          const w = locate(doc.kind, d, id)?.node.props?.wrapper;
          if (w && typeof w === 'object') recipe(w as Exclude<WrapperSpec, false>);
        }, group)
      }
    />
  );
}

type Mode = 'inherit' | 'none' | 'own';

function WrapperFields({
  title,
  spec,
  modes,
  scope,
  set,
  edit,
}: {
  title: string;
  spec: WrapperSpec | undefined;
  modes: [Mode, string, WrapperSpec | undefined][];
  scope: string;
  set: (next: WrapperSpec | undefined) => void;
  edit: (recipe: (w: Exclude<WrapperSpec, false>) => void, group?: string) => void;
}) {
  const catalog = useUi((s) => s.catalog);
  const mode: Mode = spec && typeof spec === 'object' ? 'own' : spec === false ? 'none' : modes[0][0];
  const fallback = catalog?.defaultWrapper ?? 'Section';
  const wrapperWidget = spec && typeof spec === 'object' ? spec.widget ?? fallback : fallback;
  const candidates = Object.entries(catalog?.widgets ?? {}).filter(([, w]) => w.slots?.default || w.slots?.['*']).map(([name]) => name);
  const schema = catalog?.widgets[wrapperWidget]?.schema as Record<string, unknown> | undefined;
  const summary = modes.find(([m]) => m === mode)?.[1] ?? '';
  return (
    <details open={mode === 'own'} className="group border-t border-border">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-2 text-[11px] font-semibold tracking-[0.05em] text-muted uppercase hover:text-heading [&::-webkit-details-marker]:hidden">
        <span className="inline-block transition-transform group-open:rotate-90">›</span>
        {title}
        <span className="ml-auto text-[10px] font-normal tracking-normal normal-case">{mode === 'own' ? wrapperWidget : summary.toLowerCase()}</span>
      </summary>
      <div className="flex flex-col gap-2 px-3 pb-3">
        <div role="radiogroup" aria-label={title} className="flex gap-1">
          {modes.map(([m, label, value]) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => mode !== m && set(value)}
              className="flex-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted aria-checked:border-primary aria-checked:bg-primary-soft aria-checked:text-primary"
            >
              {label}
            </button>
          ))}
        </div>
        {mode === 'own' && spec && typeof spec === 'object' && (
          <>
            <label className="flex flex-col gap-1 text-[11px] font-medium text-heading">
              Widget
              <select
                className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                value={spec.widget ?? ''}
                onChange={(e) => set({ ...(e.target.value ? { widget: e.target.value } : {}), props: e.target.value && e.target.value !== fallback ? {} : spec.props ?? {} })}
              >
                <option value="">{fallback} (the default)</option>
                {candidates.filter((c) => c !== fallback).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            {schema && (
              <div className="-mx-3">
                <Form
                  schema={schema}
                  value={spec.props}
                  scope={scope}
                  onChange={(pointer, value, group) =>
                    edit((w) => {
                      w.props ??= {};
                      if (pointer.length === 0) w.props = value as Record<string, unknown>;
                      else setIn(w.props, pointer, value);
                    }, group)
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    </details>
  );
}

/** A page's own fields — title, description, URL, SEO — and its layout. */
function DocSettings({ doc }: { doc: Doc }) {
  const catalog = useUi((s) => s.catalog);
  if (catalog && doc.collection === 'layouts') return <LayoutSettings doc={doc} />;
  if (catalog && doc.collection === 'navigation') return <MenuSettings doc={doc} />;
  if (doc.kind !== 'page' || !catalog) {
    return (
      <PanelShell title="Document">
        <p className="m-3 text-xs text-muted">{doc.relPath}</p>
      </PanelShell>
    );
  }
  const locale = doc.id.includes('/') ? doc.id.split('/')[0] : catalog.i18n.defaultLocale;
  const layouts = [...new Set(catalog.layouts.filter((l) => l.locale === locale || l.locale === catalog.i18n.defaultLocale).map((l) => l.name))].sort();
  const onChange = (pointer: Pointer, value: unknown, group?: string) =>
    editCurrent((d) => {
      if (pointer.length === 0) return;
      setIn(d, pointer, value);
    }, group);
  return (
    <PanelShell title="Page" subtitle={doc.relPath}>
      <div className="flex flex-col gap-1 p-3 pb-0">
        <label className="text-[11px] font-medium text-heading" htmlFor="page-layout">
          Layout
        </label>
        <select
          id="page-layout"
          className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
          value={(doc.data.layout as string | undefined) ?? ''}
          onChange={(e) => editCurrent((d) => setIn(d, ['layout'], e.target.value || undefined))}
        >
          <option value="">default</option>
          {layouts.filter((l) => l !== 'default').map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </div>
      <Form schema={catalog.pageSettings} value={doc.data} onChange={onChange} scope={`${doc.key}:settings`} />
    </PanelShell>
  );
}

/** The page the preview shows a layout or a menu through, among those that use it. */
function ShownThrough({ doc }: { doc: Doc }) {
  const catalog = useUi((s) => s.catalog);
  const via = useUi((s) => s.previewVia[doc.key]);
  const setVia = useUi((s) => s.setPreviewVia);
  const pages = pagesShowing(doc, catalog);
  if (!pages.length) return <p className="m-0 text-[11px] text-muted">No page uses it yet: the preview shows the home page.</p>;
  return (
    <label className="flex flex-col gap-1 text-[11px] font-medium text-heading">
      Preview through
      <select className="rounded-md border border-border bg-background px-2 py-1.5 text-xs" value={via && pages.includes(via) ? via : pages[0]} onChange={(e) => setVia(doc.key, e.target.value)}>
        {pages.map((p) => (
          <option key={p} value={p}>
            {p} ({catalog?.pageUrls[p] ?? p})
          </option>
        ))}
      </select>
    </label>
  );
}

/** A layout: which pages use it and the outlets it offers them. Its nodes are edited in the outline. */
function LayoutSettings({ doc }: { doc: Doc }) {
  const catalog = useUi((s) => s.catalog)!;
  const usedBy = catalog.layouts.find((l) => l.id === doc.id)?.usedBy ?? [];
  const names = outletNames(doc);
  return (
    <PanelShell title="Layout" subtitle={doc.relPath}>
      <div className="flex flex-col gap-3 p-3">
        <p className="m-0 text-xs text-heading">
          Used by {usedBy.length} page{usedBy.length === 1 ? '' : 's'}.
        </p>
        <ShownThrough doc={doc} />
        <div>
          <h3 className="m-0 pb-1 text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">Outlets</h3>
          {names.length ? (
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0 text-xs">
              {names.map((n, i) => (
                <li key={i} className="font-mono text-heading">
                  {n}
                  {n === 'default' ? <span className="font-sans text-muted"> · the page's sections</span> : <span className="font-sans text-muted"> · slots.{n}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p role="alert" className="m-0 text-[11px] text-warning">
              No Outlet: a page using this layout has nowhere to go. Add one from the outline.
            </p>
          )}
        </div>
      </div>
    </PanelShell>
  );
}

/**
 * A menu: its label and its items. The items take the shape of the prop
 * that uses the menu (a Header's links, a Footer's columns), so the form is
 * that prop's; a menu nothing uses yet is edited as JSON.
 */
function MenuSettings({ doc }: { doc: Doc }) {
  const catalog = useUi((s) => s.catalog)!;
  const entry = catalog.navigation.find((n) => n.id === doc.id);
  const itemsSchema = entry?.itemsSchema as Record<string, unknown> | null | undefined;
  const onChange = (pointer: Pointer, value: unknown, group?: string) => editCurrent((d) => (pointer.length === 0 ? undefined : setIn(d, pointer, value)), group);
  return (
    <PanelShell title="Menu" subtitle={doc.relPath}>
      <div className="flex flex-col gap-3 p-3 pb-0">
        {entry && entry.usedBy.length > 0 ? (
          <div className="text-[11px] text-muted">
            Used by{' '}
            {entry.usedBy.map((u, i) => (
              <span key={i}>
                {i > 0 && ', '}
                <span className="font-mono text-heading">
                  {u.widget}.{u.prop}
                </span>{' '}
                in {u.doc}
              </span>
            ))}
            .
          </div>
        ) : (
          <p className="m-0 text-[11px] text-muted">Nothing uses this menu yet. Link it from a widget's prop with {'{ "$ref": "navigation/…" }'}.</p>
        )}
        <ShownThrough doc={doc} />
      </div>
      <Form schema={MENU_FIELDS} value={doc.data} onChange={onChange} scope={`${doc.key}:menu`} />
      {itemsSchema ? (
        <div className="border-t border-border">
          <Form schema={{ type: 'object', properties: { items: { ...itemsSchema, title: 'Items' } } }} value={doc.data} onChange={onChange} scope={`${doc.key}:items`} />
        </div>
      ) : (
        <JsonField label="Items" value={doc.data.items ?? []} onChange={(v) => editCurrent((d) => void (d.items = v))} />
      )}
    </PanelShell>
  );
}

const MENU_FIELDS = { type: 'object', properties: { label: { type: 'string', title: 'Label' }, description: { type: 'string', title: 'Description' } } };

/** A value edited as JSON text, applied when it parses. */
function JsonField({ label, value, onChange }: { label: string; value: unknown; onChange: (v: any) => void }) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);
  return (
    <label className="flex flex-col gap-1 p-3 text-[11px] font-medium text-heading">
      {label} (JSON)
      <textarea
        value={text}
        spellCheck={false}
        rows={14}
        onChange={(e) => {
          setText(e.target.value);
          try {
            onChange(JSON.parse(e.target.value));
            setError(null);
          } catch (err) {
            setError((err as Error).message);
          }
        }}
        className="rounded-md border border-border bg-background p-2 font-mono text-[11px] text-heading outline-none focus:border-primary"
      />
      {error && <span className="font-normal text-danger">{error}</span>}
    </label>
  );
}

/** The names of a layout's outlets, the unnamed one as `default`. */
function outletNames(doc: Doc): string[] {
  const out: string[] = [];
  const walk = (nodes: any[]) => {
    for (const n of nodes ?? []) {
      if (n?.widget === 'Outlet') out.push((n.props?.name as string | undefined) || 'default');
      for (const kids of Object.values(n?.slots ?? {})) walk(kids as any[]);
    }
  };
  walk(doc.data.sections);
  return out;
}
