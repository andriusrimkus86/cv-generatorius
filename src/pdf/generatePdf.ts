import { createElement } from 'react';
import type { CvDocument } from '../model/types';
import { cvFileName } from '../templates/common';
import { getTemplate } from '../templates/registry';
import { getTheme } from '../templates/themes';

/** Sugeneruoja tikrą PDF failą (tekstas pažymimas, šriftai įterpti). Veikia ir telefone, ir be interneto. */
export async function generatePdf(doc: CvDocument): Promise<File> {
  const template = getTemplate(doc.templateId);
  const [{ pdf }, Component] = await Promise.all([import('@react-pdf/renderer'), template.loadPdf()]);
  const element = createElement(Component, { data: doc.data, theme: getTheme(doc.themeId) });
  // react-pdf tipai tikisi <Document> elemento; šablono komponentas jį ir grąžina.
  const blob = await pdf(element as Parameters<typeof pdf>[0]).toBlob();
  return new File([blob], `${cvFileName(doc.data)}.pdf`, { type: 'application/pdf' });
}

export function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function canShareFile(file: File) {
  return typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
}

export async function shareFile(file: File) {
  try {
    await navigator.share({ files: [file], title: file.name });
  } catch (e) {
    // Vartotojas uždarė dalinimosi langą: tai ne klaida.
    if ((e as DOMException).name !== 'AbortError') throw e;
  }
}
