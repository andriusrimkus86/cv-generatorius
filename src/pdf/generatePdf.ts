import { createElement } from 'react';
import type { CvDocument } from '../model/types';
import { cvFileName } from '../templates/common';
import { getTemplate } from '../templates/registry';
import { getTheme } from '../templates/themes';
import { A4_H_MM, A4_W_MM, fitScale, measureContentMm, MM_TO_PT, type PdfMode } from './modes';

/*
 * PDF generuojamas tiesiogiai naršyklėje (react-pdf + pdf-lib), todėl veikia ir Android programėlėje,
 * kur window.print() nieko nedaro. Tekstas lieka tekstu, šriftai įterpiami.
 *
 * Režimai:
 * - a4: standartiniai A4 puslapiai, įrašai neperkerpami;
 * - continuous: vienas A4 pločio puslapis, kurio aukštis lygus turinio aukščiui (visada 1 puslapis);
 * - fit: ištisinis puslapis proporcingai sumažinamas ir įdedamas į vieną A4.
 */

export interface PdfResult {
  file: File;
  pages: number;
  /** Puslapio aukštis mm (režime a4: 297). */
  heightMm: number;
  /** Režime „fit“ pritaikytas mastelis (1 = nesumažinta). */
  scale: number;
}

const A4_PT: [number, number] = [A4_W_MM * MM_TO_PT, A4_H_MM * MM_TO_PT];

async function renderPdf(doc: CvDocument, size?: [number, number]): Promise<Uint8Array> {
  const template = getTemplate(doc.templateId);
  const [{ pdf }, Component] = await Promise.all([import('@react-pdf/renderer'), template.loadPdf()]);
  const element = createElement(Component, { data: doc.data, theme: getTheme(doc.themeId), size });
  // react-pdf tipai tikisi <Document> elemento; šablono komponentas jį ir grąžina.
  const blob = await pdf(element as Parameters<typeof pdf>[0]).toBlob();
  return new Uint8Array(await blob.arrayBuffer());
}

async function pageCount(bytes: Uint8Array) {
  const { PDFDocument } = await import('pdf-lib');
  return (await PDFDocument.load(bytes)).getPageCount();
}

/**
 * Vienas ištisinis puslapis. Pradinis aukštis imamas iš HTML šablono matavimo; jei PDF makete
 * turinys vis tiek persikelia į antrą puslapį (skirtingas teksto laužymas), aukštis didinamas.
 */
async function renderContinuous(doc: CvDocument): Promise<{ bytes: Uint8Array; heightMm: number }> {
  const measured = await measureContentMm(doc);
  // Trumpesnis nei A4 turinys: lygiai A4 aukštis. Ilgesnis: išmatuotas aukštis su nedidele atsarga.
  let heightMm = measured <= A4_H_MM ? A4_H_MM : Math.ceil(measured) + 2;
  for (let attempt = 0; attempt < 15; attempt++) {
    const bytes = await renderPdf(doc, [A4_PT[0], heightMm * MM_TO_PT]);
    if ((await pageCount(bytes)) === 1) return { bytes, heightMm };
    heightMm = Math.ceil(heightMm + Math.max(3, heightMm * 0.012));
  }
  throw new Error('Nepavyko sutalpinti CV į vieną puslapį.');
}

/** Ištisinį puslapį sumažina ir įdeda į A4 (vektorinė grafika ir tekstas išlieka). */
async function fitToA4(doc: CvDocument, tall: Uint8Array, heightMm: number) {
  const { PDFDocument, rgb } = await import('pdf-lib');
  const scale = fitScale(heightMm);
  const out = await PDFDocument.create();
  const [embedded] = await out.embedPdf(tall, [0]);
  const page = out.addPage(A4_PT);
  const w = embedded.width * scale;
  const h = embedded.height * scale;
  // Dešinėje likusi juosta užpildoma šablono kraštine spalva, kad nebūtų balto tarpo prie spalvoto fono.
  const edge = getTemplate(doc.templateId).rightEdge(getTheme(doc.themeId));
  const n = parseInt(edge.slice(1), 16);
  page.drawRectangle({
    x: w,
    y: 0,
    width: A4_PT[0] - w,
    height: A4_PT[1],
    color: rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255),
  });
  page.drawPage(embedded, { x: 0, y: A4_PT[1] - h, xScale: scale, yScale: scale });
  copyMetadata(out, await PDFDocument.load(tall));
  return { bytes: await out.save(), scale };
}

function copyMetadata(
  target: import('pdf-lib').PDFDocument,
  source: import('pdf-lib').PDFDocument,
) {
  const title = source.getTitle();
  const author = source.getAuthor();
  if (title) target.setTitle(title);
  if (author) target.setAuthor(author);
  target.setLanguage('lt');
}

export async function generatePdf(doc: CvDocument, mode: PdfMode = 'a4'): Promise<PdfResult> {
  let bytes: Uint8Array;
  let heightMm = A4_H_MM;
  let scale = 1;

  if (mode === 'a4') {
    bytes = await renderPdf(doc);
  } else {
    const tall = await renderContinuous(doc);
    heightMm = tall.heightMm;
    if (mode === 'continuous') {
      bytes = tall.bytes;
    } else if (heightMm <= A4_H_MM) {
      bytes = tall.bytes; // jau telpa į A4
    } else {
      ({ bytes, scale } = await fitToA4(doc, tall.bytes, heightMm));
      heightMm = A4_H_MM;
    }
  }

  const file = new File([bytes as BlobPart], `${cvFileName(doc.data)}.pdf`, { type: 'application/pdf' });
  return { file, pages: await pageCount(bytes), heightMm, scale };
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
