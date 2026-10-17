import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createSeedData } from '../model/seed';
import type { CvDocument } from '../model/types';
import type { PdfMode } from '../pdf/modes';
import { PreviewPane } from '../preview/PreviewPane';
import { preparePrint } from '../preview/print';
import { PrintRoot } from '../preview/PrintRoot';
import { DEFAULT_TEMPLATE_ID } from '../templates/registry';
import { DEFAULT_THEME_ID } from '../templates/themes';

/**
 * Tik kūrimo režime: #/dev/print?variant=short|long|xlong&template=...&theme=...&mode=a4|continuous|fit
 * Naudojama spausdinimo maketui tikrinti (headless Chrome --print-to-pdf) be IndexedDB.
 */
export function PrintTest() {
  const [params] = useSearchParams();
  const variant = params.get('variant') ?? 'long';
  const mode = (params.get('mode') ?? 'a4') as PdfMode;
  const doc = useMemo<CvDocument>(() => {
    const data = createSeedData();
    for (const s of data.sections) {
      if (s.kind !== 'timeline') continue;
      if (variant === 'short') s.items = s.items.slice(0, s.title === 'Išsilavinimas' ? 2 : 3);
      // Labai ilgas CV (~3 A4): įrašai pakartojami.
      if (variant === 'xlong') s.items = [...s.items, ...s.items, ...s.items].map((it, i) => ({ ...it, id: `${it.id}-${i}` }));
    }
    return {
      id: 'dev',
      profileId: 'dev',
      name: 'dev',
      templateId: params.get('template') ?? DEFAULT_TEMPLATE_ID,
      themeId: params.get('theme') ?? DEFAULT_THEME_ID,
      data,
      updatedAt: 0,
    };
  }, [variant, params]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let alive = true;
    void preparePrint(doc, mode).then((c) => (alive ? (cleanup = c) : c()));
    return () => {
      alive = false;
      cleanup?.();
    };
  }, [doc, mode]);

  return (
    <>
      <PreviewPane doc={doc} />
      <PrintRoot doc={doc} />
    </>
  );
}
