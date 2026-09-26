import { useContext, type ReactNode } from 'react';
import { CloseIcon, PinIcon } from './icons';
import { PanelSide } from './panelSide';
import { useUi } from '../store/ui';

/**
 * The chrome every side panel shares: a 48px title row (with the pin, which
 * docks the panel beside the preview or floats it over it, and the close),
 * an optional sub-row, scrolling content.
 */
export default function PanelShell({ title, subtitle, onClose, subHeader, children }: { title: string; subtitle?: string; onClose?: () => void; subHeader?: ReactNode; children: ReactNode }) {
  const side = useContext(PanelSide);
  const pinned = useUi((s) => (side ? s.pinned[side] : false));
  const togglePin = useUi((s) => s.togglePin);
  return (
    <section className="flex h-full min-h-0 flex-col" aria-label={title}>
      <header className="flex h-12 shrink-0 items-center gap-1.5 border-b border-border px-3">
        <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
          <h2 className="m-0 truncate text-[11px] font-semibold tracking-[0.05em] text-muted uppercase">{title}</h2>
          {subtitle && <span className="truncate text-[11px] text-muted/70">{subtitle}</span>}
        </div>
        {side && (
          <button
            type="button"
            onClick={() => togglePin(side)}
            aria-pressed={pinned}
            aria-label="Pin the panel"
            title={pinned ? 'Pinned beside the preview: unpin to float it over the preview' : 'Floating over the preview: pin it to give it its own space'}
            className="grid size-6 place-items-center rounded-md text-muted hover:bg-surface-hover hover:text-heading aria-pressed:text-primary"
          >
            <PinIcon size={12} className={`transition-transform ${pinned ? '' : 'rotate-45'}`} />
          </button>
        )}
        {onClose && (
          <button type="button" onClick={onClose} className="grid size-6 place-items-center rounded-md text-muted hover:bg-surface-hover hover:text-heading" aria-label={`Close ${title}`}>
            <CloseIcon size={12} />
          </button>
        )}
      </header>
      {subHeader && <div className="shrink-0 border-b border-border px-3 py-2">{subHeader}</div>}
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </section>
  );
}
