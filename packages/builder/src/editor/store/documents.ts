import { create } from 'zustand';
import { applyPatches, enablePatches, produceWithPatches, type Patch } from 'immer';
import { api, ApiError } from '../api';
import { kindOf, type Kind } from '../../shared/roots';
import { assignIds, stripIds } from '../tree/ids';

enablePatches();

/**
 * The open documents. Each keeps its own draft (with ephemeral node ids),
 * its undo and redo as immer patches, whether it differs from what was
 * saved, and the issues the server reported. Edits go through `edit`, which
 * records them; typing into the same field within a moment is one step.
 */
export interface Issue {
  path: string;
  message: string;
  severity: 'error' | 'warning';
  source: 'schema' | 'tree' | 'ref' | 'props';
}

interface Step {
  patches: Patch[];
  inverse: Patch[];
  group?: string;
  at: number;
}

export interface Doc {
  key: string;
  collection: string;
  id: string;
  kind: Kind;
  format: 'json' | 'md' | 'yaml';
  relPath: string;
  etag: string;
  readOnly: boolean;
  data: Record<string, any>;
  body?: string;
  ephemeral: string[];
  past: Step[];
  future: Step[];
  /** `past.length` when last saved: dirty is any other length. */
  saved: number;
  issues: Issue[];
  saving: boolean;
  /** The file changed on disk since it was opened (from the events stream). */
  diskChanged: boolean;
  /** A save the server refused because the file changed: what is on disk now. */
  conflict?: { etag: string; data: Record<string, any>; body?: string };
  error?: string;
}

export const docKey = (collection: string, id: string) => `${collection}/${id}`;
export const isDirty = (d: Doc | undefined) => !!d && d.past.length !== d.saved;

interface Loaded {
  collection: string;
  id: string;
  format: Doc['format'];
  relPath: string;
  etag: string;
  readOnly: boolean;
  data: Record<string, any>;
  body?: string;
}

const RECOVERY = 'parche-builder:draft:';
const GROUP_MS = 700;

interface DocsState {
  docs: Record<string, Doc>;
  current: string | null;
  open: (collection: string, id: string) => Promise<void>;
  close: (key: string) => void;
  edit: (key: string, recipe: (data: Record<string, any>) => void, group?: string) => void;
  undo: (key: string) => void;
  redo: (key: string) => void;
  save: (key: string) => Promise<boolean>;
  validate: (key: string) => Promise<void>;
  resolveConflict: (key: string, keep: 'mine' | 'theirs') => void;
  reload: (key: string) => Promise<void>;
  markDiskChanged: (collection: string, id: string) => void;
}

function fromLoaded(l: Loaded): Doc {
  const kind = kindOf(l.collection);
  const data = structuredClone(l.data);
  const { ephemeral } = assignIds(kind, data);
  return {
    key: docKey(l.collection, l.id),
    collection: l.collection,
    id: l.id,
    kind,
    format: l.format,
    relPath: l.relPath,
    etag: l.etag,
    readOnly: l.readOnly,
    data,
    body: l.body,
    ephemeral: [...ephemeral],
    past: [],
    future: [],
    saved: 0,
    issues: [],
    saving: false,
    diskChanged: false,
  };
}

const validateTimers = new Map<string, ReturnType<typeof setTimeout>>();
const recoveryTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useDocs = create<DocsState>((set, get) => {
  const patch = (key: string, fn: (d: Doc) => Partial<Doc>) => set((s) => (s.docs[key] ? { docs: { ...s.docs, [key]: { ...s.docs[key], ...fn(s.docs[key]) } } } : s));

  const afterChange = (key: string) => {
    clearTimeout(validateTimers.get(key));
    validateTimers.set(key, setTimeout(() => void get().validate(key), 600));
    clearTimeout(recoveryTimers.get(key));
    recoveryTimers.set(
      key,
      setTimeout(() => {
        const d = get().docs[key];
        try {
          if (d && isDirty(d)) localStorage.setItem(RECOVERY + key, JSON.stringify({ etag: d.etag, data: stripIds(d.kind, d.data, new Set(d.ephemeral)), body: d.body }));
          else localStorage.removeItem(RECOVERY + key);
        } catch {}
      }, 1000),
    );
  };

  return {
    docs: {},
    current: null,

    open: async (collection, id) => {
      const key = docKey(collection, id);
      if (!get().docs[key]) {
        const loaded = await api<Loaded>(`doc?collection=${encodeURIComponent(collection)}&id=${encodeURIComponent(id)}`);
        const doc = fromLoaded(loaded);
        // Unsaved changes from a previous session, still based on this file: offer them back.
        try {
          const kept = JSON.parse(localStorage.getItem(RECOVERY + key) ?? 'null');
          if (kept && kept.etag === loaded.etag && confirm(`You have unsaved changes to ${loaded.relPath} from before. Restore them?`)) {
            const restored = fromLoaded({ ...loaded, data: kept.data, body: kept.body });
            const [next, patches, inverse] = produceWithPatches(doc.data, () => restored.data);
            doc.data = next;
            doc.ephemeral = restored.ephemeral;
            doc.body = kept.body;
            doc.past = [{ patches, inverse, at: Date.now() }];
          } else localStorage.removeItem(RECOVERY + key);
        } catch {}
        set((s) => ({ docs: { ...s.docs, [key]: doc } }));
        void get().validate(key);
      }
      set({ current: key });
    },

    close: (key) =>
      set((s) => {
        const { [key]: _, ...docs } = s.docs;
        return { docs, current: s.current === key ? null : s.current };
      }),

    edit: (key, recipe, group) => {
      const d = get().docs[key];
      if (!d || d.readOnly) return;
      const [next, patches, inverse] = produceWithPatches(d.data, recipe);
      if (!patches.length) return;
      const now = Date.now();
      const last = d.past[d.past.length - 1];
      // Keystrokes in one field, close together and not across a save, are one step.
      const merge = group && last && last.group === group && now - last.at < GROUP_MS && d.past.length > d.saved;
      const past = merge ? [...d.past.slice(0, -1), { patches: [...last.patches, ...patches], inverse: [...inverse, ...last.inverse], group, at: now }] : [...d.past, { patches, inverse, group, at: now }];
      patch(key, () => ({ data: next, past, future: [] }));
      afterChange(key);
    },

    undo: (key) => {
      const d = get().docs[key];
      const step = d?.past[d.past.length - 1];
      if (!d || !step) return;
      patch(key, () => ({ data: applyPatches(d.data, step.inverse), past: d.past.slice(0, -1), future: [step, ...d.future] }));
      afterChange(key);
    },

    redo: (key) => {
      const d = get().docs[key];
      const step = d?.future[0];
      if (!d || !step) return;
      patch(key, () => ({ data: applyPatches(d.data, step.patches), past: [...d.past, step], future: d.future.slice(1) }));
      afterChange(key);
    },

    validate: async (key) => {
      const d = get().docs[key];
      if (!d) return;
      try {
        const { issues } = await api<{ issues: Issue[] }>(`validate?collection=${encodeURIComponent(d.collection)}&id=${encodeURIComponent(d.id)}`, {
          method: 'POST',
          body: { data: stripIds(d.kind, d.data, new Set(d.ephemeral)) },
        });
        patch(key, () => ({ issues }));
      } catch (e) {
        patch(key, () => ({ error: e instanceof Error ? e.message : String(e) }));
      }
    },

    save: async (key) => {
      const d = get().docs[key];
      if (!d || d.readOnly || d.saving) return false;
      patch(key, () => ({ saving: true, error: undefined }));
      const at = d.past.length;
      try {
        const r = await api<{ etag: string; issues: Issue[] }>(`doc?collection=${encodeURIComponent(d.collection)}&id=${encodeURIComponent(d.id)}`, {
          method: 'PUT',
          body: { etag: d.etag, data: stripIds(d.kind, d.data, new Set(d.ephemeral)), body: d.body },
        });
        patch(key, () => ({ etag: r.etag, saved: at, issues: r.issues, saving: false, diskChanged: false, conflict: undefined }));
        try {
          localStorage.removeItem(RECOVERY + key);
        } catch {}
        return true;
      } catch (e) {
        if (e instanceof ApiError && e.status === 409) {
          const detail = (e.body as { detail?: Doc['conflict'] }).detail;
          patch(key, () => ({ saving: false, conflict: detail }));
        } else if (e instanceof ApiError && e.status === 422) {
          const detail = (e.body as { detail?: { issues: Issue[] } }).detail;
          patch(key, () => ({ saving: false, issues: detail?.issues ?? [], error: 'Not saved: the document does not match its collection\'s schema.' }));
        } else {
          patch(key, () => ({ saving: false, error: e instanceof Error ? e.message : String(e) }));
        }
        return false;
      }
    },

    resolveConflict: (key, keep) => {
      const d = get().docs[key];
      if (!d?.conflict) return;
      if (keep === 'mine') {
        // Save over what is on disk now: the next save carries its etag.
        patch(key, () => ({ etag: d.conflict!.etag, conflict: undefined }));
        void get().save(key);
      } else {
        const fresh = fromLoaded({ collection: d.collection, id: d.id, format: d.format, relPath: d.relPath, etag: d.conflict.etag, readOnly: d.readOnly, data: d.conflict.data, body: d.conflict.body });
        set((s) => ({ docs: { ...s.docs, [key]: fresh } }));
        void get().validate(key);
      }
    },

    reload: async (key) => {
      const d = get().docs[key];
      if (!d) return;
      const loaded = await api<Loaded>(`doc?collection=${encodeURIComponent(d.collection)}&id=${encodeURIComponent(d.id)}`);
      set((s) => ({ docs: { ...s.docs, [key]: fromLoaded(loaded) } }));
      void get().validate(key);
    },

    markDiskChanged: (collection, id) => {
      const key = docKey(collection, id);
      const d = get().docs[key];
      if (!d || d.saving) return;
      // A change we just wrote comes back as an event too: the etag tells them apart.
      void api<{ etag: string }>(`doc?collection=${encodeURIComponent(collection)}&id=${encodeURIComponent(id)}`).then((disk) => {
        const now = get().docs[key];
        if (!now || disk.etag === now.etag) return;
        if (isDirty(now)) patch(key, () => ({ diskChanged: true }));
        else void get().reload(key);
      });
    },
  };
});
