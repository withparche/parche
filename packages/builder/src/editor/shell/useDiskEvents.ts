import { useEffect } from 'react';
import { useDocs } from '../store/documents';
import { useUi } from '../store/ui';
import { api } from '../api';
import type { Catalog } from '../store/types';

const token = document.querySelector<HTMLMetaElement>('meta[name="parche-builder-token"]')?.content ?? '';

/** Changes on disk while the editor is open: reload what is untouched, flag what is not; a new widget schema refreshes the catalog. */
export function useDiskEvents() {
  useEffect(() => {
    const source = new EventSource(`/_parche/api/events?t=${encodeURIComponent(token)}`);
    source.onmessage = (m) => {
      const e = JSON.parse(m.data) as { type: string; collection?: string; id?: string };
      if (e.type === 'file-changed' && e.collection && e.id) {
        useDocs.getState().markDiskChanged(e.collection, e.id);
      }
      if (e.type === 'catalog-changed') void api<Catalog>('catalog').then(useUi.getState().setCatalog);
    };
    return () => source.close();
  }, []);
}
