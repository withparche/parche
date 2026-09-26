import { useEffect } from 'react';
import { useDocs } from '../store/documents';
import { useUi } from '../store/ui';
import { api } from '../api';
import type { Catalog } from '../store/types';

const token = document.querySelector<HTMLMetaElement>('meta[name="parche-builder-token"]')?.content ?? '';

let timer: ReturnType<typeof setTimeout> | undefined;
const refreshCatalog = () => {
  clearTimeout(timer);
  timer = setTimeout(() => void api<Catalog>('catalog').then(useUi.getState().setCatalog, () => undefined), 300);
};

/** Changes on disk while the editor is open: reload what is untouched, flag what is not; a new widget schema, layout or menu refreshes the catalog. */
export function useDiskEvents() {
  useEffect(() => {
    const source = new EventSource(`/_parche/api/events?t=${encodeURIComponent(token)}`);
    source.onmessage = (m) => {
      const e = JSON.parse(m.data) as { type: string; collection?: string; id?: string };
      if (e.type === 'file-changed' && e.collection && e.id) {
        useDocs.getState().markDiskChanged(e.collection, e.id);
      }
      // Which pages use a layout or a menu, and the outlets a layout offers, are in the catalog.
      const shapes = e.type === 'file-changed' && ['pages', 'layouts', 'navigation', 'patterns'].includes(e.collection ?? '');
      if (e.type === 'catalog-changed' || shapes) refreshCatalog();
    };
    return () => source.close();
  }, []);
}
