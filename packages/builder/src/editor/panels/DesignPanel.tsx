import { useEffect, useMemo, useState } from 'react';
import PanelShell from '../shell/PanelShell';
import { SearchIcon } from '../shell/icons';
import { useUi } from '../store/ui';
import { tokensDirty, useTokens, valueIn, type Scope, type TokenMeta } from '../store/tokens';
import { previewClient } from '../preview/usePreview';

/**
 * The site's own token values: the base look or one theme, light or dark.
 * Each token shows its base value (the placeholder), the value it has on
 * the page now (read from the preview) and, when the site sets it, the
 * site's value with a reset. Changes show in the preview at once; Save
 * writes src/parche.tokens.json.
 */
const SECTIONS: { title: string; open: boolean; test: (name: string, m: TokenMeta) => boolean }[] = [
  { title: 'Colour roles', open: true, test: (n, m) => m.layer === 'sys' && m.group === 'color' },
  { title: 'Type', open: false, test: (n, m) => m.layer === 'sys' && m.group !== 'color' },
  { title: 'Shape and rhythm', open: false, test: (n, m) => m.layer === 'conf' },
  { title: 'Palette', open: false, test: (n, m) => m.layer === 'ref' && m.group === 'color' },
  { title: 'Radii, shadows, fonts', open: false, test: (n, m) => m.layer === 'ref' && m.group !== 'color' },
];

const short = (name: string) => name.replace(/^--ds-(sys|ref|conf)-(color-)?/, '');

export default function DesignPanel() {
  const close = useUi((s) => s.togglePanel);
  const themes = useUi((s) => s.catalog?.themes);
  const setLook = useUi((s) => s.setPreviewLook);
  const t = useTokens();
  const [query, setQuery] = useState('');
  const [effective, setEffective] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!t.loaded) void t.load().catch(() => undefined);
  }, [t.loaded]);
  // The site's default theme is the scope a person most likely means.
  useEffect(() => {
    if (t.loaded && themes?.default && t.scope.kind === 'base') t.setScope({ kind: 'theme', name: themes.default });
  }, [t.loaded, themes?.default]);
  // Show what is being edited: that theme, that scheme.
  useEffect(() => {
    setLook({ theme: t.scope.kind === 'theme' ? t.scope.name : '', scheme: t.mode });
  }, [t.scope, t.mode, setLook]);

  const names = useMemo(() => Object.keys(t.meta).filter((n) => !query || n.includes(query.toLowerCase()) || (t.meta[n].description ?? '').toLowerCase().includes(query.toLowerCase())), [t.meta, query]);
  // What the page resolves each token to, after the draft and the scheme apply.
  useEffect(() => {
    const timer = setTimeout(() => setEffective(previewClient()?.computed(names) ?? {}), 200);
    return () => clearTimeout(timer);
  }, [names, t.draft, t.scope, t.mode]);

  const dirty = tokensDirty(t);
  const scopeValue = t.scope.kind === 'base' ? '' : t.scope.name;
  return (
    <PanelShell
      title="Design"
      subtitle="tokens"
      onClose={() => close('design')}
      subHeader={
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            <select aria-label="Scope" value={scopeValue} onChange={(e) => t.setScope((e.target.value ? { kind: 'theme', name: e.target.value } : { kind: 'base' }) as Scope)} className="min-w-0 flex-1 rounded-md border border-border bg-background px-1.5 py-1 text-xs">
              <option value="">Base look</option>
              {(themes?.list ?? []).map((th) => (
                <option key={th.value} value={th.value}>
                  Theme: {th.label}
                  {th.value === themes?.default ? ' (default)' : ''}
                </option>
              ))}
            </select>
            <div role="radiogroup" aria-label="Scheme" className="flex gap-px rounded-md bg-surface-hover p-0.5">
              {(['light', 'dark'] as const).map((m) => (
                <button key={m} type="button" role="radio" aria-checked={t.mode === m} onClick={() => t.setMode(m)} className="rounded px-2 py-0.5 text-[11px] text-muted aria-checked:bg-background aria-checked:text-heading">
                  {m === 'light' ? 'Light' : 'Dark'}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 rounded-md bg-surface-hover px-2 py-1.5 text-muted focus-within:outline-2 focus-within:outline-ring">
            <SearchIcon size={13} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tokens" aria-label="Search tokens" className="min-w-0 flex-1 bg-transparent text-xs text-heading outline-none placeholder:text-muted" />
          </label>
        </div>
      }
    >
      {!t.loaded && <p className="m-3 text-xs text-muted">Loading the tokens…</p>}
      {t.loaded &&
        SECTIONS.map((sec) => {
          const rows = names.filter((n) => sec.test(n, t.meta[n]));
          if (!rows.length) return null;
          return (
            <details key={sec.title} open={sec.open || !!query} className="group border-b border-border">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-2 text-[11px] font-semibold tracking-[0.05em] text-muted uppercase hover:text-heading [&::-webkit-details-marker]:hidden">
                <span className="inline-block transition-transform group-open:rotate-90">›</span>
                {sec.title}
                <span className="ml-auto font-normal">{rows.length}</span>
              </summary>
              <ul className="m-0 flex list-none flex-col gap-1 px-3 pb-3">
                {rows.map((name) => (
                  <TokenRow key={name} name={name} meta={t.meta[name]} base={t.catalog?.[t.mode][name] ?? ''} value={valueIn(t.draft, t.scope, t.mode, name)} effective={effective[name]} onChange={(v) => t.set(name, v)} />
                ))}
              </ul>
            </details>
          );
        })}
      {t.loaded && (
        <div className="sticky bottom-0 flex items-center gap-2 border-t border-border bg-surface p-2">
          {t.error ? <span className="min-w-0 flex-1 truncate text-[11px] text-danger" title={t.error}>{t.error}</span> : <span className="flex-1 text-[11px] text-muted">{dirty ? 'Unsaved token changes' : 'src/parche.tokens.json'}</span>}
          <button type="button" disabled={!dirty} onClick={t.discard} className="rounded-md px-2 py-1 text-xs text-muted hover:text-heading disabled:opacity-40">
            Discard
          </button>
          <button type="button" disabled={!dirty || t.saving} onClick={() => void t.save()} className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-on-primary disabled:bg-surface-hover disabled:text-muted">
            {t.saving ? 'Saving…' : 'Save tokens'}
          </button>
        </div>
      )}
    </PanelShell>
  );
}

function TokenRow({ name, meta, base, value, effective, onChange }: { name: string; meta: TokenMeta; base: string; value?: string; effective?: string; onChange: (v: string | undefined) => void }) {
  const isColor = meta.type === 'color';
  return (
    <li className="flex items-center gap-2" title={meta.description}>
      {isColor && <span className="size-5 shrink-0 rounded border border-border" style={{ background: effective || value || base }} aria-hidden="true" />}
      <div className="min-w-0 flex-1">
        <label htmlFor={`tok-${name}`} className={`block truncate font-mono text-[11px] ${value !== undefined ? 'text-primary' : 'text-heading'}`}>
          {short(name)}
        </label>
        <input
          id={`tok-${name}`}
          value={value ?? ''}
          placeholder={base}
          onChange={(e) => onChange(e.target.value.trim() === '' ? undefined : e.target.value)}
          className="w-full rounded border border-border bg-background px-1.5 py-1 font-mono text-[11px] text-heading outline-none placeholder:text-muted/60 focus:border-primary"
        />
        {effective && effective !== (value ?? base) && <span className="block truncate font-mono text-[10px] text-muted" title="What the page uses now">{effective}</span>}
      </div>
      {value !== undefined && (
        <button type="button" onClick={() => onChange(undefined)} aria-label={`Reset ${short(name)}`} className="shrink-0 rounded px-1 text-[11px] text-muted hover:text-danger">
          ×
        </button>
      )}
    </li>
  );
}
