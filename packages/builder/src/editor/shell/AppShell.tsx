import { useEffect, type FC } from 'react';
import { api } from '../api';
import { useUi, type PanelId, type Viewport } from '../store/ui';
import { isDirty, useDocs, type Doc } from '../store/documents';
import { useCurrentDoc } from '../store/current';
import type { Catalog } from '../store/types';
import TopHeader from './TopHeader';
import ActivityRail from './ActivityRail';
import ResizeHandle from './ResizeHandle';
import { usePanelResize } from './usePanelResize';
import { useEditorKeys } from './useEditorKeys';
import { useDiskEvents } from './useDiskEvents';
import PreviewFrame from '../preview/PreviewFrame';
import WidgetsPanel from '../panels/WidgetsPanel';
import PagesPanel from '../panels/PagesPanel';
import OutlinePanel from '../panels/OutlinePanel';
import Inspector from '../inspector/Inspector';
import { DesktopIcon, MobileIcon, RedoIcon, TabletIcon, UndoIcon } from './icons';

const panels: Record<PanelId, FC> = { pages: PagesPanel, outline: OutlinePanel, widgets: WidgetsPanel };
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

/** The page's URL on the site, as the page route builds it. */
function pageUrl(doc: Doc | undefined, defaultLocale: string): string {
  if (!doc || doc.collection !== 'pages') return '/';
  const [locale, ...rest] = doc.id.includes('/') ? doc.id.split('/') : [defaultLocale, doc.id];
  const key = rest.join('/');
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  if (key === 'home') return prefix || '/';
  return `${prefix}/${(doc.data.urlSlug as string | undefined) ?? key}`;
}

/** The editor: the header, the rail, a left panel, the preview, and the inspector on the right. */
export default function AppShell() {
  const panel = useUi((s) => s.panel);
  const togglePanel = useUi((s) => s.togglePanel);
  const setPanel = useUi((s) => s.setPanel);
  const viewport = useUi((s) => s.viewport);
  const setViewport = useUi((s) => s.setViewport);
  const inspected = useUi((s) => s.inspected);
  const inspect = useUi((s) => s.inspect);
  const dark = useUi((s) => s.dark);
  const previewRev = useUi((s) => s.previewRev);
  const bumpPreview = useUi((s) => s.bumpPreview);
  const defaultLocale = useUi((s) => s.catalog?.i18n.defaultLocale ?? 'en');
  const doc = useCurrentDoc();
  const { undo, redo, save } = useDocs.getState();
  const left = usePanelResize(280, 'left', 200, () => panel && togglePanel(panel));
  const right = usePanelResize(320, 'right', 240, () => inspect(null));
  useCatalog();
  useEditorKeys();
  useDiskEvents();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  // Opening a document shows its outline.
  const current = useDocs((s) => s.current);
  useEffect(() => {
    if (current) setPanel('outline');
  }, [current, setPanel]);
  // Leaving with unsaved changes asks first.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (Object.values(useDocs.getState().docs).some(isDirty)) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  const Left = panel ? panels[panel] : null;
  const dirty = isDirty(doc);
  const iconBtn = 'grid size-7 place-items-center rounded-md text-muted hover:bg-surface-hover hover:text-heading disabled:opacity-30';
  return (
    <div className="flex h-full flex-col bg-background text-text">
      <TopHeader>
        <div className="flex w-full items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {doc && (
              <>
                <span className={`size-1.5 shrink-0 rounded-full ${dirty ? 'bg-warning' : 'bg-success'}`} title={dirty ? 'Unsaved changes' : 'Saved'} />
                <span className="truncate text-[11px] font-medium text-muted">{doc.relPath}</span>
              </>
            )}
          </div>
          <div role="group" aria-label="Device width" className="flex gap-px rounded-md bg-surface-hover p-0.5">
            {viewports.map(({ id, label, Icon }) => (
              <button key={id} type="button" onClick={() => setViewport(id)} aria-pressed={viewport === id} aria-label={label} title={label} className="grid h-[26px] w-8 place-items-center rounded text-muted hover:text-heading aria-pressed:bg-primary-soft aria-pressed:text-primary">
                <Icon size={15} />
              </button>
            ))}
          </div>
          <div className="flex flex-1 items-center justify-end gap-1">
            {doc && (
              <>
                <button type="button" className={iconBtn} disabled={!doc.past.length} onClick={() => undo(doc.key)} aria-label="Undo" title="Undo (⌘Z)">
                  <UndoIcon size={15} />
                </button>
                <button type="button" className={iconBtn} disabled={!doc.future.length} onClick={() => redo(doc.key)} aria-label="Redo" title="Redo (⇧⌘Z)">
                  <RedoIcon size={15} />
                </button>
                <button
                  type="button"
                  disabled={!dirty || doc.saving || doc.readOnly}
                  onClick={() => void save(doc.key)}
                  className="ml-1 h-7 rounded-md bg-primary px-3 text-xs font-medium text-on-primary hover:bg-primary-hover disabled:bg-surface-hover disabled:text-muted"
                  title="Save (⌘S)"
                >
                  {doc.saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}
                </button>
              </>
            )}
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
        <main className="flex min-w-0 flex-1 flex-col">
          {doc && <Notices doc={doc} />}
          <div className="min-h-0 flex-1">
            <PreviewFrame src={pageUrl(doc, defaultLocale)} rev={previewRev} onReload={bumpPreview} />
          </div>
        </main>
        {(doc || inspected) && (
          <>
            <ResizeHandle {...right.handle} label="Resize the inspector" />
            <aside style={{ width: right.width }} className="flex shrink-0 flex-col overflow-hidden bg-surface" aria-label="Inspector">
              <Inspector />
            </aside>
          </>
        )}
      </div>
    </div>
  );
}

/** What the editor has to say about the open document: a conflict, a change on disk, a failed save. */
function Notices({ doc }: { doc: Doc }) {
  const { resolveConflict, reload } = useDocs.getState();
  const bar = 'flex items-center gap-2 border-b px-3 py-2 text-xs';
  if (doc.conflict) {
    return (
      <div role="alert" className={`${bar} border-warning bg-warning-soft text-heading`}>
        <span className="flex-1">{doc.relPath} changed on disk (another editor, git) since you opened it.</span>
        <button type="button" onClick={() => resolveConflict(doc.key, 'mine')} className="rounded-md bg-primary px-2 py-1 text-on-primary">
          Keep mine
        </button>
        <button type="button" onClick={() => resolveConflict(doc.key, 'theirs')} className="rounded-md border border-border px-2 py-1">
          Take the file's
        </button>
      </div>
    );
  }
  if (doc.diskChanged) {
    return (
      <div role="status" className={`${bar} border-warning bg-warning-soft text-heading`}>
        <span className="flex-1">The file changed on disk. Your unsaved changes are still here.</span>
        <button type="button" onClick={() => confirm('Discard your changes and load the file?') && void reload(doc.key)} className="rounded-md border border-border px-2 py-1">
          Load the file
        </button>
      </div>
    );
  }
  if (doc.error) {
    return (
      <div role="alert" className={`${bar} border-danger bg-danger-soft text-danger`}>
        {doc.error}
      </div>
    );
  }
  if (doc.readOnly) {
    return <div className={`${bar} border-border bg-surface-2 text-muted`}>{doc.relPath} is YAML: the builder shows it but does not write it yet.</div>;
  }
  return null;
}
