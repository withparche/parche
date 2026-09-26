import { useUi } from '../store/ui';

const widths = { desktop: '100%', tablet: '768px', mobile: '375px' } as const;

/**
 * The page being edited, in an iframe at the chosen device width. It is a
 * page of the dev server, so a save reloads it by itself once Astro has
 * synced the content; `rev` reloads it by hand.
 */
export default function PreviewFrame({ src, rev, onReload }: { src: string; rev: number; onReload: () => void }) {
  const viewport = useUi((s) => s.viewport);
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-border bg-surface px-3 text-[11px] text-muted">
        <span className="truncate font-mono">{src}</span>
        <button type="button" onClick={onReload} className="ml-auto rounded px-1.5 py-0.5 hover:bg-surface-hover hover:text-heading" title="Reload the preview">
          Reload
        </button>
        <a href={src} target="_blank" rel="noopener" className="rounded px-1.5 py-0.5 hover:bg-surface-hover hover:text-heading">
          Open
        </a>
      </div>
      <div className="flex min-h-0 flex-1 justify-center overflow-hidden bg-surface-2 data-[device=mobile]:py-4 data-[device=tablet]:py-4" data-device={viewport}>
        <iframe
          key={`${src}#${rev}`}
          title="Preview"
          src={src}
          style={{ width: widths[viewport] }}
          className="h-full max-w-full border-0 bg-background shadow-[0_0_0_1px_var(--ds-sys-color-border)] transition-[width] duration-200"
        />
      </div>
    </div>
  );
}
