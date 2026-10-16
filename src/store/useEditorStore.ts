import { create } from 'zustand';
import { db } from '../db/db';
import { saveDocument } from '../db/repo';
import type { CvData, CvDocument } from '../model/types';

const SAVE_DELAY_MS = 400;

interface EditorState {
  doc: CvDocument | null;
  saving: 'idle' | 'pending' | 'saved' | 'error';
  load: (docId: string) => Promise<boolean>;
  /** Pakeičia CV duomenis: `fn` gauna kopiją, kurią gali laisvai keisti. */
  update: (fn: (draft: CvData) => void) => void;
  setDocFields: (fields: Partial<Pick<CvDocument, 'name' | 'themeId' | 'templateId'>>) => void;
  flush: () => Promise<void>;
}

let timer: ReturnType<typeof setTimeout> | undefined;
// Pakeitimų skaitikliai: rev didėja po kiekvieno pakeitimo, savedRev – paskutinis įrašytas.
let rev = 0;
let savedRev = 0;

export const useEditorStore = create<EditorState>((set, get) => {
  const scheduleSave = () => {
    rev++;
    set({ saving: 'pending' });
    clearTimeout(timer);
    timer = setTimeout(() => void get().flush(), SAVE_DELAY_MS);
  };

  return {
    doc: null,
    saving: 'idle',

    async load(docId) {
      await get().flush();
      const doc = await db.documents.get(docId);
      rev = savedRev = 0;
      set({ doc: doc ?? null, saving: 'idle' });
      return !!doc;
    },

    update(fn) {
      const doc = get().doc;
      if (!doc) return;
      const data = structuredClone(doc.data);
      fn(data);
      set({ doc: { ...doc, data } });
      scheduleSave();
    },

    setDocFields(fields) {
      const doc = get().doc;
      if (!doc) return;
      set({ doc: { ...doc, ...fields } });
      scheduleSave();
    },

    async flush() {
      clearTimeout(timer);
      timer = undefined;
      const { doc } = get();
      if (!doc || rev === savedRev) return;
      const savingRev = rev;
      try {
        await saveDocument(doc);
        savedRev = Math.max(savedRev, savingRev);
        if (rev === savedRev) set({ saving: 'saved' });
      } catch (e) {
        console.error(e);
        set({ saving: 'error' });
      }
    },
  };
});

// Neišsaugotus pakeitimus įrašome, kai programėlė paslepiama ar uždaroma (ypač svarbu telefone).
if (typeof window !== 'undefined') {
  const flush = () => void useEditorStore.getState().flush();
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}
