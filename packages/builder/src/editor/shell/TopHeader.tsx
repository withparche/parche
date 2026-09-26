import type { ReactNode } from 'react';
import { useUi } from '../store/ui';
import { MoonIcon, SunIcon } from './icons';

/** The top bar: the mark, the contextual actions in the middle, the chrome's light/dark switch. */
export default function TopHeader({ children }: { children?: ReactNode }) {
  const dark = useUi((s) => s.dark);
  const toggleDark = useUi((s) => s.toggleDark);
  return (
    <header className="flex h-12 shrink-0 items-center border-b border-border bg-background px-3.5">
      <span className="shrink-0 text-xs font-bold tracking-[0.05em] text-muted">PARCHE</span>
      <div className="mx-3.5 flex min-w-0 flex-1 items-center">{children}</div>
      <button
        type="button"
        onClick={toggleDark}
        className="grid size-7 shrink-0 place-items-center rounded-md text-muted hover:bg-surface-hover hover:text-heading"
        aria-label={dark ? 'Use the light interface' : 'Use the dark interface'}
        title={dark ? 'Light interface' : 'Dark interface'}
      >
        {dark ? <SunIcon size={15} /> : <MoonIcon size={15} />}
      </button>
    </header>
  );
}
