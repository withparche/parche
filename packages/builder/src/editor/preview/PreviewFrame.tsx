import { useEffect, useRef } from 'react';
import { useUi } from '../store/ui';
import { previewToken, usePreview } from './usePreview';
import { useDocs } from '../store/documents';

const widths = { desktop: '100%', tablet: '768px', mobile: '375px' } as const;

/**
 * The page being edited, in its preview: the site's own render with the
 * editor's unsaved drafts, updated in place after each edit. Edit mode turns
 * a click into a selection; browse mode lets the page behave. `rev` reloads
 * it by hand.
 */
export default function PreviewFrame({ src, rev, onReload }: { src: string; rev: number; onReload: () => void }) {
  const viewport = useUi((s) => s.viewport);
  const mode = useUi((s) => s.previewMode);
  const setMode = useUi((s) => s.setPreviewMode);
  const error = useUi((s) => s.previewError);
  const frame = useRef<HTMLIFrameElement>(null);
  const { onLoad, ready } = usePreview(frame);
  const current = useDocs((s) => s.current);
  const url = `/_parche/preview/${previewToken}${src}`;
  const themes = useUi((s) => s.catalog?.themes);
  // Look at the page under another theme or scheme, without touching the site:
  // set on the frame's <html>, which the in-place refresh leaves alone.
  const theme = useUi((s) => s.previewTheme);
  const scheme = useUi((s) => s.previewScheme);
  const setLook = useUi((s) => s.setPreviewLook);
  const applyLook = () => {
    const html = frame.current?.contentDocument?.documentElement;
    if (!html || !frame.current?.contentWindow?.location.pathname.startsWith('/_parche/preview/')) return;
    // Remember the page's own theme and scheme once, to go back to them.
    if (html.dataset.siteTheme === undefined) html.dataset.siteTheme = html.getAttribute('data-theme') ?? '';
    if (html.dataset.siteDark === undefined) html.dataset.siteDark = String(html.classList.contains('dark'));
    const t = theme || html.dataset.siteTheme;
    if (t) html.setAttribute('data-theme', t);
    else html.removeAttribute('data-theme');
    html.classList.toggle('dark', scheme ? scheme === 'dark' : html.dataset.siteDark === 'true');
  };
  useEffect(applyLook, [theme, scheme]);
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-border bg-surface px-3 text-[11px] text-muted">
        <div role="radiogroup" aria-label="Preview mode" className="flex gap-px rounded bg-surface-hover p-0.5">
          {(['edit', 'browse'] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className="rounded px-1.5 py-0.5 aria-checked:bg-background aria-checked:text-heading">
              {m === 'edit' ? 'Select' : 'Browse'}
            </button>
          ))}
        </div>
        <span className="truncate font-mono">{src}</span>
        {themes && themes.list.length > 1 && (
          <select aria-label="Preview theme" value={theme} onChange={(e) => setLook({ theme: e.target.value })} className="rounded border border-border bg-background px-1 py-0.5 text-[11px]">
            <option value="">{themes.default ? `${themes.default} (site)` : 'Site theme'}</option>
            {themes.list.filter((t) => t.value !== themes.default).map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        )}
        <select aria-label="Preview colour scheme" value={scheme} onChange={(e) => setLook({ scheme: e.target.value as '' | 'light' | 'dark' })} className="rounded border border-border bg-background px-1 py-0.5 text-[11px]">
          <option value="">Scheme: site</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <button type="button" onClick={onReload} className="ml-auto rounded px-1.5 py-0.5 hover:bg-surface-hover hover:text-heading" title="Reload the preview">
          Reload
        </button>
        <a href={src} target="_blank" rel="noopener" className="rounded px-1.5 py-0.5 hover:bg-surface-hover hover:text-heading" title="The page as saved, in a new tab">
          Open
        </a>
      </div>
      {error && (
        <p role="alert" className="m-0 border-b border-danger bg-danger-soft px-3 py-1.5 text-[11px] text-danger">
          {error}
        </p>
      )}
      <div className="flex min-h-0 flex-1 justify-center overflow-hidden bg-surface-2 data-[device=mobile]:py-4 data-[device=tablet]:py-4" data-device={viewport}>
        <iframe
          ref={frame}
          key={`${src}#${rev}`}
          title="Preview"
          src={ready === current ? url : 'about:blank'}
          onLoad={() => { onLoad(); applyLook(); }}
          style={{ width: widths[viewport] }}
          className="h-full max-w-full border-0 bg-background shadow-[0_0_0_1px_var(--ds-sys-color-border)] transition-[width] duration-200"
        />
      </div>
    </div>
  );
}
