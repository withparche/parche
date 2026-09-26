import type { FC } from 'react';
import { useUi, type PanelId } from '../store/ui';
import { OutlineIcon, PagesIcon, PaletteIcon, SiteIcon, WidgetsIcon } from './icons';

const items: { id: PanelId; label: string; Icon: FC<{ size?: number }> }[] = [
  { id: 'pages', label: 'Documents', Icon: PagesIcon },
  { id: 'outline', label: 'Outline', Icon: OutlineIcon },
  { id: 'widgets', label: 'Widgets', Icon: WidgetsIcon },
  { id: 'design', label: 'Design', Icon: PaletteIcon },
  { id: 'site', label: 'Site', Icon: SiteIcon },
];

/** The left rail: one button per panel; the active one is marked and pressed. */
export default function ActivityRail() {
  const panel = useUi((s) => s.panel);
  const toggle = useUi((s) => s.togglePanel);
  return (
    <nav aria-label="Panels" className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-border bg-background py-2">
      {items.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => toggle(id)}
          aria-pressed={panel === id}
          title={label}
          aria-label={label}
          className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-hover hover:text-heading aria-pressed:bg-primary-soft aria-pressed:text-primary"
        >
          <Icon size={18} />
        </button>
      ))}
    </nav>
  );
}
