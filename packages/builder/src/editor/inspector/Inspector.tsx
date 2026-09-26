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
  const canWrap = at.node.widget !== 'Outlet';
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
      {canWrap && <WrapperEditor doc={doc} id={id} />}
    </PanelShell>
  );
}

/** How this node is wrapped: as its list says, not at all, or in a wrapper of its own (Section by default). */
function WrapperEditor({ doc, id }: { doc: Doc; id: string }) {
  const catalog = useUi((s) => s.catalog);
  const at = locate(doc.kind, doc.data, id)!;
  const spec = at.node.wrapper as WrapperSpec | undefined;
  const mode = spec === undefined ? 'inherit' : spec === false ? 'none' : 'own';
  const fallback = catalog?.defaultWrapper ?? 'Section';
  const wrapperWidget = spec && typeof spec === 'object' ? spec.widget ?? fallback : fallback;
  const candidates = Object.entries(catalog?.widgets ?? {}).filter(([, w]) => w.slots?.default || w.slots?.['*']).map(([name]) => name);
  const schema = catalog?.widgets[wrapperWidget]?.schema as Record<string, unknown> | undefined;
  const set = (next: WrapperSpec | undefined) => editCurrent((d) => setWrapper(doc.kind, d, id, next));
  return (
    <details open={mode === 'own'} className="group border-t border-border">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-2 text-[11px] font-semibold tracking-[0.05em] text-muted uppercase hover:text-heading [&::-webkit-details-marker]:hidden">
        <span className="inline-block transition-transform group-open:rotate-90">›</span>
        Wrapper
        <span className="ml-auto text-[10px] font-normal tracking-normal normal-case">{mode === 'inherit' ? 'from its list' : mode === 'none' ? 'none' : wrapperWidget}</span>
      </summary>
      <div className="flex flex-col gap-2 px-3 pb-3">
        <div role="radiogroup" aria-label="Wrapper" className="flex gap-1">
          {(['inherit', 'none', 'own'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => set(m === 'inherit' ? undefined : m === 'none' ? false : { props: {} })}
              className="flex-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted aria-checked:border-primary aria-checked:bg-primary-soft aria-checked:text-primary"
            >
              {m === 'inherit' ? 'From the list' : m === 'none' ? 'None' : 'Its own'}
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
                <option value="">{fallback} (the list's)</option>
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
                  scope={`${id}:wrapper`}
                  onChange={(pointer, value, group) =>
                    editCurrent((d) => {
                      const node = locate(doc.kind, d, id)?.node;
                      if (!node || !node.wrapper || typeof node.wrapper !== 'object') return;
                      node.wrapper.props ??= {};
                      if (pointer.length === 0) node.wrapper.props = value as Record<string, unknown>;
                      else setIn(node.wrapper.props, pointer, value);
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
