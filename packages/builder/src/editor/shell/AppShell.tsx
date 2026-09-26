import { useEffect, type FC } from 'react';
import { api } from '../api';
import { useUi, type PanelId, type Viewport } from '../store/ui';
import type { Catalog } from '../store/types';
import TopHeader from './TopHeader';
import ActivityRail from './ActivityRail';
import ResizeHandle from './ResizeHandle';
import { usePanelResize } from './usePanelResize';
import PreviewFrame from '../preview/PreviewFrame';
import WidgetsPanel from '../panels/WidgetsPanel';
import PagesPanel from '../panels/PagesPanel';
import WidgetInfo from '../inspector/WidgetInfo';
import { DesktopIcon, MobileIcon, TabletIcon } from './icons';

const panels: Record<PanelId, FC> = { pages: PagesPanel, widgets: WidgetsPanel };
const viewports: { id: Viewport; label: string; Icon: FC<{ size?: number }> }[] = [
  { id: 'desktop', label: 'Desktop', Icon: DesktopIcon },
  { id: 'tablet', label: 'Tablet, 768px', Icon: TabletIcon },
  { id: 'mobile', label: 'Mobile, 375px', Icon: MobileIcon },
];

function useCatalog() {
  const setCatalog = useUi((s) => s.setCatalog);
  const setError = useUi((s) => s.setCatalogError);
  useEffect(() => {
    api<Catalog>('catalog').then(setCatalog, (e: Error) => setError(`The catalog did not load: ${e.message}`));
  }, [setCatalog, setError]);
}

/** The editor: the header, the rail, a left panel, the preview, and the inspector on the right. */
export default function AppShell() {
  const panel = useUi((s) => s.panel);
  const togglePanel = useUi((s) => s.togglePanel);
  const viewport = useUi((s) => s.viewport);
  const setViewport = useUi((s) => s.setViewport);
  const inspected = useUi((s) => s.inspected);
  const inspect = useUi((s) => s.inspect);
  const dark = useUi((s) => s.dark);
  const left = usePanelResize(260, 'left', 180, () => panel && togglePanel(panel));
  const right = usePanelResize(300, 'right', 220, () => inspect(null));
  useCatalog();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const Left = panel ? panels[panel] : null;
  return (
    <div className="flex h-full flex-col bg-background text-text">
      <TopHeader>
        <div className="flex w-full items-center justify-center">
          <div role="group" aria-label="Device width" className="flex gap-px rounded-md bg-surface-hover p-0.5">
            {viewports.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setViewport(id)}
                aria-pressed={viewport === id}
                aria-label={label}
                title={label}
                className="grid h-[26px] w-8 place-items-center rounded text-muted hover:text-heading aria-pressed:bg-primary-soft aria-pressed:text-primary"
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>
      </TopHeader>
      <div className="flex min-h-0 flex-1">
        <ActivityRail />
        {Left && (
          <>
            <div style={{ width: left.width }} className="flex shrink-0 flex-col overflow-hidden bg-surface">
              <Left />
            </div>
            <ResizeHandle {...left.handle} label="Resize the panel" />
          </>
        )}
        <main className="min-w-0 flex-1">
          <PreviewFrame src="/" />
        </main>
        {inspected && (
          <>
            <ResizeHandle {...right.handle} label="Resize the inspector" />
            <aside style={{ width: right.width }} className="flex shrink-0 flex-col overflow-hidden bg-surface" aria-label="Inspector">
              <WidgetInfo />
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
