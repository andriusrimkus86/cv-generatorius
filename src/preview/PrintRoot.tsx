import { createPortal } from 'react-dom';
import type { CvDocument } from '../model/types';
import { getTemplate } from '../templates/registry';
import { getTheme } from '../templates/themes';

/**
 * Spausdinimui skirta CV kopija be redaktoriaus. Ekrane paslėpta (print.css).
 * Puslapių fonas (šoninė juosta) piešiamas ant <html>, todėl kartojasi kiekviename puslapyje.
 */
export function PrintRoot({ doc }: { doc: CvDocument }) {
  const template = getTemplate(doc.templateId);
  const theme = getTheme(doc.themeId);
  const Template = template.component;
  return createPortal(
    <div className="print-root">
      <style>{`@media print { html { background: ${template.pageBackground(theme)} !important; } body { background: transparent !important; } }`}</style>
      <Template data={doc.data} theme={theme} />
    </div>,
    document.body,
  );
}
