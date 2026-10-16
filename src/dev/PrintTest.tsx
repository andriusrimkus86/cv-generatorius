import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createSeedData } from '../model/seed';
import type { CvDocument } from '../model/types';
import { PreviewPane } from '../preview/PreviewPane';
import { PrintRoot } from '../preview/PrintRoot';
import { DEFAULT_TEMPLATE_ID } from '../templates/registry';
import { DEFAULT_THEME_ID } from '../templates/themes';

/**
 * Tik kūrimo režime: #/dev/print?variant=short|long&theme=...
 * Naudojama PDF maketui tikrinti (headless Chrome --print-to-pdf) be IndexedDB.
 */
export function PrintTest() {
  const [params] = useSearchParams();
  const variant = params.get('variant') ?? 'long';
  const doc = useMemo<CvDocument>(() => {
    const data = createSeedData();
    if (variant === 'short') {
      // Trumpas CV: tik 3 darbai ir 2 išsilavinimo įrašai, kad tilptų į 1 puslapį.
      for (const s of data.sections) {
        if (s.kind === 'timeline') s.items = s.items.slice(0, s.title === 'Išsilavinimas' ? 2 : 3);
      }
    }
    return {
      id: 'dev',
      profileId: 'dev',
      name: 'dev',
      templateId: DEFAULT_TEMPLATE_ID,
      themeId: params.get('theme') ?? DEFAULT_THEME_ID,
      data,
      updatedAt: 0,
    };
  }, [variant, params]);

  return (
    <>
      <PreviewPane doc={doc} />
      <PrintRoot doc={doc} />
    </>
  );
}
