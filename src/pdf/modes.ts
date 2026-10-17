import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { CvDocument } from '../model/types';
import { getTemplate } from '../templates/registry';
import { getTheme } from '../templates/themes';

export type PdfMode = 'a4' | 'continuous' | 'fit';

export const PDF_MODES: { id: PdfMode; label: string; hint: string }[] = [
  {
    id: 'continuous',
    label: 'Vienas ištisinis puslapis',
    hint: 'A4 pločio, aukštis pagal turinį. Patogu skaityti ekrane.',
  },
  {
    id: 'a4',
    label: 'A4 puslapiais',
    hint: 'Standartiniai A4 puslapiai spausdinimui. Ilgas CV skaidomas.',
  },
  {
    id: 'fit',
    label: 'Sutalpinti į vieną A4',
    hint: 'Jei netelpa, viskas proporcingai sumažinama iki vieno A4.',
  },
];

export const DEFAULT_PDF_MODE: PdfMode = 'continuous';

export const A4_W_MM = 210;
export const A4_H_MM = 297;
export const MM_TO_PT = 72 / 25.4;
/** Žemiau šio mastelio režime „Sutalpinti“ rodomas įspėjimas. */
export const SMALL_SCALE_WARNING = 0.8;

const MODE_KEY = 'cv-pdf-mode';

/** Paskutinis pasirinktas režimas (šio įrenginio patogumui, todėl localStorage). */
export function loadPdfMode(): PdfMode {
  try {
    const v = localStorage.getItem(MODE_KEY);
    if (v === 'a4' || v === 'continuous' || v === 'fit') return v;
  } catch {
    // privatus langas ar užblokuota saugykla
  }
  return DEFAULT_PDF_MODE;
}

export function savePdfMode(mode: PdfMode) {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    // nesvarbu
  }
}

/**
 * Išmatuoja CV turinio aukštį milimetrais: šablonas nupiešiamas nematomame A4 pločio konteineryje.
 * Grąžina ne mažiau nei A4 aukštį (šablono min-height yra 297 mm).
 */
export async function measureContentMm(doc: CvDocument): Promise<number> {
  await document.fonts.ready;
  const host = document.createElement('div');
  host.style.cssText = `position:absolute;left:-10000px;top:0;width:${A4_W_MM}mm;visibility:hidden;pointer-events:none;`;
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    const Template = getTemplate(doc.templateId).component;
    flushSync(() => root.render(createElement(Template, { data: doc.data, theme: getTheme(doc.themeId) })));
    // getBoundingClientRect priverstinai apskaičiuoja maketą. requestAnimationFrame čia nenaudojame:
    // paslėptame lange (pvz. telefone fone) jis gali niekada neįvykti. Nuotraukos dydis fiksuotas.
    const px = (host.firstElementChild as HTMLElement | null)?.getBoundingClientRect().height ?? 0;
    return Math.max(A4_H_MM, (px * 25.4) / 96);
  } finally {
    root.unmount();
    host.remove();
  }
}

/** Mastelis režimui „Sutalpinti į vieną A4“. */
export const fitScale = (contentMm: number) => Math.min(1, A4_H_MM / contentMm);
