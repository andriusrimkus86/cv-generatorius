import type { CvDocument } from '../model/types';
import { A4_H_MM, A4_W_MM, fitScale, measureContentMm, type PdfMode } from '../pdf/modes';
import { cvFileName } from '../templates/common';
import { getTemplate } from '../templates/registry';
import { getTheme } from '../templates/themes';

const STYLE_ID = 'print-mode-style';

/**
 * Paruošia naršyklės spausdinimą pagal režimą: įterpia `@page` dydį ir, jei reikia, sumažina CV.
 * Grąžina valymo funkciją. Naudojama ir kūrimo testams (#/dev/print?mode=...).
 */
export async function preparePrint(doc: CvDocument, mode: PdfMode): Promise<() => void> {
  const template = getTemplate(doc.templateId);
  const theme = getTheme(doc.themeId);
  let css: string;

  if (mode === 'a4') {
    css = `@page { size: A4; margin: 0; }`;
  } else {
    const contentMm = await measureContentMm(doc);
    if (mode === 'continuous') {
      // Trumpesnis nei A4: lygiai 297 mm. Ilgesnis: +1 mm atsarga, kad apvalinimas nesukurtų tuščio antro puslapio.
      const h = contentMm <= A4_H_MM ? A4_H_MM : Math.ceil(contentMm) + 1;
      css = `
        @page { size: ${A4_W_MM}mm ${h}mm; margin: 0; }`;
    } else {
      const s = fitScale(contentMm);
      css = `
        @page { size: A4; margin: 0; }
        @media print {
          html { background: ${template.pageBackground(theme, s)} !important; }
          html, body { height: ${A4_H_MM}mm; overflow: hidden; }
          .print-root .cv-sheet { zoom: ${s}; }
        }`;
    }
  }

  document.getElementById(STYLE_ID)?.remove();
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = css;
  // Į body pabaigą, kad perrašytų PrintRoot numatytąjį foną (tas pats !important, vėlesnė taisyklė laimi).
  document.body.appendChild(style);
  return () => style.remove();
}

/**
 * Atidaro naršyklės spausdinimo langą („Išsaugoti kaip PDF“). Veikia kompiuteryje;
 * įdiegtoje Android programėlėje window.print() nieko nedaro, todėl ten naudojamas PDF atsisiuntimas.
 */
export async function printCv(doc: CvDocument, mode: PdfMode = 'a4') {
  const prevTitle = document.title;
  document.title = cvFileName(doc.data);
  const cleanup = await preparePrint(doc, mode);
  const restore = () => {
    document.title = prevTitle;
    cleanup();
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);
  await document.fonts.ready;
  window.print();
}
