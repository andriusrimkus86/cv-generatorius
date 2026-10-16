import { useLayoutEffect, useRef, useState } from 'react';
import type { CvDocument } from '../model/types';
import { getTemplate } from '../templates/registry';
import { getTheme } from '../templates/themes';
import './preview.css';

// 96 CSS px colyje
const MM = 96 / 25.4;
const PAGE_W = 210 * MM;
const PAGE_H = 297 * MM;

/** Tikro dydžio A4 šablonas, sumažintas iki konteinerio pločio, su puslapių ribų žymomis. */
export function PreviewPane({ doc }: { doc: CvDocument }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pages, setPages] = useState(1);

  useLayoutEffect(() => {
    const wrap = wrapRef.current!;
    const sheet = sheetRef.current!;
    const ro = new ResizeObserver(() => {
      const avail = wrap.clientWidth - 24;
      setScale(Math.min(1.25, Math.max(0.2, avail / PAGE_W)));
      setPages(Math.max(1, Math.ceil((sheet.offsetHeight - 1) / PAGE_H)));
    });
    ro.observe(wrap);
    ro.observe(sheet);
    return () => ro.disconnect();
  }, []);

  const template = getTemplate(doc.templateId);
  const theme = getTheme(doc.themeId);
  const Template = template.component;

  return (
    <div className="preview-wrap" ref={wrapRef}>
      <div className="preview-frame" style={{ width: PAGE_W * scale, height: pages * PAGE_H * scale }}>
        <div className="preview-scaled" style={{ transform: `scale(${scale})` }}>
          <div className="preview-bg" style={{ height: pages * PAGE_H, background: template.pageBackground(theme) }} />
          <div ref={sheetRef} className="preview-sheet">
            <Template data={doc.data} theme={theme} />
          </div>
          {Array.from({ length: pages - 1 }, (_, i) => (
            <div key={i} className="preview-break" style={{ top: (i + 1) * PAGE_H }}>
              <span>{i + 2} psl.</span>
            </div>
          ))}
        </div>
      </div>
      {pages > 1 && <p className="preview-note">Puslapių ribos apytikslės: PDF įrašai nebus perkirpti per vidurį.</p>}
    </div>
  );
}
