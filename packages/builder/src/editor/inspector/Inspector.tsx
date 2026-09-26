import { useState } from 'react';
import type { WrapperSpec } from '@parche/astro/content/pure';
import PanelShell from '../shell/PanelShell';
import Form, { LinkContext, type LinkActions, type Pointer } from '../forms/Form';
import { useUi } from '../store/ui';
import { useSelection } from '../store/selection';
import { editCurrent, useCurrentDoc } from '../store/current';
import type { Doc } from '../store/documents';
import { locate } from '../tree/locate';
import { replaceNode, setIn, setProp, setWrapper } from '../tree/ops';
import { withNewIds } from '../tree/ids';
import { detach, linkProp, patternFrom, propNameFor, removeProp, renameProp, setRequired, unlinkProp } from '../tree/pattern-ops';
import { schemaAt } from '../../shared/usage';
import { api, ApiError } from '../api';
import { useDocs } from '../store/documents';
import type { Catalog, CatalogPattern } from '../store/types';
import WidgetInfo from './WidgetInfo';
import { pagesShowing } from '../preview/through';
import { entryOf, localeOfDoc } from '../store/patterns';

/** Close the inspector: the preview gets the room; selecting something opens it again. */
const closeInspector = () => useUi.getState().setInspectorOpen(false);

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
  const widget = catalog ? entryOf(catalog, at.node.widget, localeOfDoc(doc.id, catalog)) : undefined;
  const schema = widget?.schema as Record<string, unknown> | undefined;
  const issues = doc.issues.filter((i) => i.path === at.path || i.path.startsWith(`${at.path}.props`) || i.path.startsWith(`${at.path}.wrapper`));
  const onChange = (pointer: Pointer, value: unknown, group?: string) => editCurrent((d) => setProp(doc.kind, d, id, pointer, value), group);
  // A list's item may carry its own wrapper; a node inside a slot is never wrapped by its list, but may ask.
  const outlet = at.node.widget === 'Outlet';
  // Two outlets of one name would take the same slot of the page.
  const name = (at.node.props?.name as string | undefined) || 'default';
  const twin = outlet && outletNames(doc).filter((n) => n === name).length > 1;
  // In a pattern, any field of its widgets can be linked to one of its props.
  const linking: LinkActions | null =
    doc.kind === 'pattern' && schema
      ? {
          link: (pointer, _value) => {
            const asked = prompt('Link this field to a prop of the pattern. Prop name:', propNameFor(pointer));
            const prop = asked?.trim().replace(/[^A-Za-z0-9_]/g, '_');
            if (!prop) return;
            editCurrent((d) => {
              const n = locate(doc.kind, d, id)?.node;
              if (n) linkProp(d as never, n, pointer, prop, schemaAt(schema, pointer) as Record<string, unknown> | null);
            });
          },
          unlink: (pointer) =>
            editCurrent((d) => {
              const n = locate(doc.kind, d, id)?.node;
              if (n) unlinkProp(d as never, n, pointer);
            }),
        }
      : null;
  return (
    <PanelShell title={widget?.label ?? at.node.widget} subtitle={at.path} onClose={() => select(null)}>
      {!outlet && !doc.readOnly && <PatternActions doc={doc} id={id} />}
      {issues.length > 0 && (
        <ul role="alert" className="m-2 flex list-none flex-col gap-1 rounded-md bg-danger-soft p-2">
          {issues.map((i, n) => (
            <li key={n} className="text-[11px] text-danger">
              <span className="font-mono">{i.path.slice(at.path.length + 1) || 'node'}</span>: {i.message}
            </li>
          ))}
        </ul>
      )}
      {!widget && <p className="m-3 text-xs text-warning">"{at.node.widget}" is {at.node.widget.startsWith('pattern/') ? 'not a pattern in src/content/patterns' : 'not a widget this site registers'}.</p>}
      {widget && !schema && <p className="m-3 text-xs text-muted">This widget declares no props.</p>}
      {schema && (
        <LinkContext.Provider value={linking}>
          <Form key={id} schema={schema} value={at.node.props} onChange={onChange} groups={(widget as { ui?: { groups?: never } })?.ui?.groups} scope={id} />
        </LinkContext.Provider>
      )}
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

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().replace(/[^a-z0-9/-]+/g, '-').replace(/^-+|-+$/g, '');

/**
 * A node and patterns: a use opens its pattern or turns back into its
 * widgets (detach: a copy the page owns); any other node can be saved as a
 * pattern, and replaced here by its use.
 */
function PatternActions({ doc, id }: { doc: Doc; id: string }) {
  const catalog = useUi((s) => s.catalog);
  const setCatalog = useUi((s) => s.setCatalog);
  const [saving, setSaving] = useState(false);
  const at = locate(doc.kind, doc.data, id)!;
  const btn = 'rounded-md border border-border px-2 py-1 text-[11px] text-muted hover:text-heading';
  if (at.node.widget.startsWith('pattern/')) {
    const p = catalog ? (entryOf(catalog, at.node.widget, localeOfDoc(doc.id, catalog)) as CatalogPattern | undefined) : undefined;
    if (!p) return null;
    return (
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <span className="flex-1 text-[11px] text-muted">A pattern: its widgets live in one place.</span>
        <button type="button" className={btn} onClick={() => void useDocs.getState().open('patterns', p.entry)}>
          Open pattern
        </button>
        <button
          type="button"
          className={btn}
          title="Replace this use with a copy of the pattern's widgets, which this page then owns"
          onClick={() => editCurrent((d) => replaceNode(doc.kind, d, id, detach(p, at.node.props).map(withNewIds)))}
        >
          Detach
        </button>
      </div>
    );
  }
  return (
    <div className="border-b border-border px-3 py-2">
      {!saving ? (
        <button type="button" className={btn} onClick={() => setSaving(true)}>
          Save as pattern
        </button>
      ) : (
        <SaveAsPattern doc={doc} id={id} catalog={catalog} onDone={(c) => { setSaving(false); if (c) setCatalog(c); }} />
      )}
    </div>
  );
}

function SaveAsPattern({ doc, id, catalog, onDone }: { doc: Doc; id: string; catalog: Catalog | null; onDone: (catalog?: Catalog) => void }) {
  const at = locate(doc.kind, doc.data, id)!;
  const locale = catalog ? localeOfDoc(doc.id, catalog) : '';
  const label0 = entryOf(catalog, at.node.widget, locale)?.label ?? at.node.widget;
  const [label, setLabel] = useState(label0);
  const [name, setName] = useState(kebab(label0));
  const [scope, setScope] = useState('');
  const [replace, setReplace] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const input = 'w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-heading outline-none focus:border-primary';
  const save = async () => {
    const id0 = kebab(name);
    if (!id0) return;
    // The node's own wrapper is how this page places it, not part of the pattern: it stays on the use.
    const { wrapper, ...node } = at.node;
    try {
      await api(`doc?collection=patterns&id=${encodeURIComponent(scope ? `${scope}/${id0}` : id0)}`, { method: 'POST', body: { data: patternFrom([node], label || label0) } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
      return;
    }
    const next = await api<Catalog>('catalog').catch(() => undefined);
    if (replace) editCurrent((d) => replaceNode(doc.kind, d, id, [{ widget: `pattern/${id0}`, id, ...(wrapper !== undefined ? { wrapper } : {}) }]));
    onDone(next);
  };
  return (
    <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); void save(); }} aria-label="Save as pattern">
      <input className={input} aria-label="Pattern label" placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
      <div className="flex gap-1.5">
        <input className={input} aria-label="Pattern name" placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
        <select className={`${input} w-auto`} aria-label="Languages" value={scope} onChange={(e) => setScope(e.target.value)}>
          <option value="">Every language</option>
          {locale && <option value={locale}>Only {locale}</option>}
        </select>
      </div>
      <label className="flex items-center gap-2 text-[11px] text-heading">
        <input type="checkbox" className="accent-primary" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
        Use the pattern here, in place of this node
      </label>
      {error && <p className="m-0 text-[11px] text-danger">{error}</p>}
      <div className="flex justify-end gap-1.5">
        <button type="button" onClick={() => onDone()} className="rounded-md px-2 py-1 text-xs text-muted hover:text-heading">
          Cancel
        </button>
        <button type="submit" disabled={!kebab(name)} className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-on-primary disabled:opacity-40">
          Save pattern
        </button>
      </div>
    </form>
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
  if (catalog && doc.collection === 'patterns') return <PatternSettings doc={doc} />;
  if (doc.kind !== 'page' || !catalog) {
    return (
      <PanelShell title="Document" onClose={closeInspector}>
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
    <PanelShell title="Page" subtitle={doc.relPath} onClose={closeInspector}>
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
    <PanelShell title="Layout" subtitle={doc.relPath} onClose={closeInspector}>
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
    <PanelShell title="Menu" subtitle={doc.relPath} onClose={closeInspector}>
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

const PATTERN_FIELDS = {
  type: 'object',
  properties: {
    label: { type: 'string', title: 'Label', description: 'What the palette shows.' },
    description: { type: 'string', title: 'Description', input: 'textarea' },
    category: { type: 'string', title: 'Category', description: 'The palette group; "patterns" when empty.' },
    icon: { type: 'string', title: 'Icon', input: 'icon' },
  },
  required: ['label'],
};

/**
 * A pattern: what the palette shows, and its props. A prop comes from
 * linking a field of one of its widgets (in the outline, select the widget,
 * then "Link to a prop" on the field); here each can be renamed, made
 * required, given help, or removed (its fields get their value back).
 */
function PatternSettings({ doc }: { doc: Doc }) {
  const catalog = useUi((s) => s.catalog)!;
  const locale = localeOfDoc(doc.id, catalog);
  const useName = `pattern/${doc.id.startsWith(`${locale}/`) ? doc.id.slice(locale.length + 1) : doc.id}`;
  const props = Object.entries((doc.data.props?.properties ?? {}) as Record<string, Record<string, unknown>>);
  const required = new Set<string>(doc.data.props?.required ?? []);
  const onChange = (pointer: Pointer, value: unknown, group?: string) => editCurrent((d) => (pointer.length === 0 ? undefined : setIn(d, pointer, value)), group);
  const input = 'w-full rounded border border-border bg-background px-1.5 py-1 text-xs text-heading outline-none focus:border-primary';
  return (
    <PanelShell title="Pattern" subtitle={doc.relPath} onClose={closeInspector}>
      <p className="m-0 px-3 pt-3 text-[11px] text-muted">
        Used as <span className="font-mono text-heading">{`{ "widget": "${useName}" }`}</span>
        {props.length ? ', with its props.' : '. It takes no props: every use is the same.'}
      </p>
      <div className="px-3 pt-3">
        <ShownThrough doc={doc} />
      </div>
      <Form schema={PATTERN_FIELDS} value={doc.data} onChange={onChange} scope={`${doc.key}:pattern`} />
      <section aria-label="Props" className="border-t border-border p-3">
        <h3 className="m-0 pb-1 text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">Props</h3>
        {!props.length && <p className="m-0 text-[11px] text-muted">None yet. Select a widget in the outline and use “Link to a prop” on a field: each use of the pattern then gives its own value.</p>}
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {props.map(([name, schema]) => (
            <li key={name} className="flex flex-col gap-1 rounded-md border border-border p-2">
              <div className="flex items-center gap-1.5">
                <input
                  className={`${input} font-mono`}
                  aria-label={`Prop ${name} name`}
                  defaultValue={name}
                  onBlur={(e) => {
                    const to = e.target.value.trim().replace(/[^A-Za-z0-9_]/g, '_');
                    if (to && to !== name) editCurrent((d) => renameProp(d as never, name, to));
                    else e.target.value = name;
                  }}
                />
                <button type="button" onClick={() => editCurrent((d) => removeProp(d as never, name))} className="shrink-0 rounded px-1 text-[11px] text-muted hover:text-danger" aria-label={`Remove prop ${name}`}>
                  Remove
                </button>
              </div>
              <label className="flex items-center gap-2 text-[11px] text-heading">
                <input type="checkbox" className="accent-primary" checked={required.has(name)} onChange={(e) => editCurrent((d) => setRequired(d as never, name, e.target.checked))} />
                Every use must give it
              </label>
              <input
                className={input}
                aria-label={`Prop ${name} help`}
                placeholder="Help for whoever fills it"
                value={(schema.description as string | undefined) ?? ''}
                onChange={(e) => editCurrent((d) => setIn(d, ['props', 'properties', name, 'description'], e.target.value || undefined), `${doc.key}:help:${name}`)}
              />
              {schema.default !== undefined && (
                <p className="m-0 truncate text-[10px] text-muted" title={JSON.stringify(schema.default)}>
                  Default: <span className="font-mono">{JSON.stringify(schema.default)}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>
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
