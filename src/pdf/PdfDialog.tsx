import { useEffect, useState } from 'react';
import type { CvDocument } from '../model/types';
import { printCv } from '../preview/print';
import { IconDownload, IconPdf } from '../ui/icons';
import { canShareFile, downloadFile, generatePdf, shareFile, type PdfResult } from './generatePdf';
import { loadPdfMode, PDF_MODES, savePdfMode, SMALL_SCALE_WARNING, type PdfMode } from './modes';

type State =
  | { kind: 'working' }
  | { kind: 'ready'; result: PdfResult; url: string }
  | { kind: 'error'; message: string };

// Įdiegtoje Android programėlėje window.print() nieko nedaro, todėl spausdinimo mygtuko nerodome.
const printUnavailable =
  /Android/i.test(navigator.userAgent) && window.matchMedia('(display-mode: standalone)').matches;

/** PDF režimo pasirinkimas ir veiksmai: atsisiųsti, dalintis (telefone), atidaryti, spausdinti. */
export function PdfDialog({ doc, onClose }: { doc: CvDocument; onClose: () => void }) {
  const [mode, setMode] = useState<PdfMode>(loadPdfMode);
  const [state, setState] = useState<State>({ kind: 'working' });

  useEffect(() => {
    let url: string | undefined;
    let alive = true;
    setState({ kind: 'working' });
    generatePdf(doc, mode)
      .then((result) => {
        url = URL.createObjectURL(result.file);
        if (alive) setState({ kind: 'ready', result, url });
      })
      .catch((e: Error) => {
        console.error(e);
        if (alive) setState({ kind: 'error', message: e.message });
      });
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
    // Dokumentas lango atidarymo metu laikomas fiksuotu; generuojama iš naujo tik pakeitus režimą.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const choose = (m: PdfMode) => {
    setMode(m);
    savePdfMode(m);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="PDF" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>PDF failas</h3>

        <div className="mode-options" role="radiogroup" aria-label="PDF režimas">
          {PDF_MODES.map((m) => (
            <label key={m.id} className={m.id === mode ? 'mode-option selected' : 'mode-option'}>
              <input type="radio" name="pdf-mode" checked={m.id === mode} onChange={() => choose(m.id)} />
              <span>
                <strong>{m.label}</strong>
                <small>{m.hint}</small>
              </span>
            </label>
          ))}
        </div>

        {state.kind === 'working' && <p className="hint">Ruošiamas PDF…</p>}

        {state.kind === 'error' && <p className="notice error">Nepavyko sukurti PDF: {state.message}</p>}

        {state.kind === 'ready' && (
          <>
            <p className="hint">
              {state.result.file.name} · {describe(state.result)} ·{' '}
              {Math.max(1, Math.round(state.result.file.size / 1024))} KB
            </p>
            {mode === 'fit' && state.result.scale < SMALL_SCALE_WARNING && (
              <p className="notice error" role="alert">
                Mastelis {Math.round(state.result.scale * 100)} %: tekstas gali būti per smulkus. Sutrumpinkite CV,
                paslėpkite dalį įrašų arba rinkitės kitą režimą.
              </p>
            )}
            <div className="pdf-actions">
              <button type="button" className="btn btn-primary" onClick={() => downloadFile(state.result.file)}>
                <IconDownload /> Atsisiųsti
              </button>
              {canShareFile(state.result.file) && (
                <button type="button" className="btn" onClick={() => shareFile(state.result.file)}>
                  Dalintis / išsaugoti…
                </button>
              )}
              <a className="btn" href={state.url} target="_blank" rel="noopener">
                <IconPdf /> Atidaryti
              </a>
            </div>
          </>
        )}

        <div className="modal-actions">
          {!printUnavailable && (
            <button
              type="button"
              className="btn btn-small"
              title="Naršyklės spausdinimo langas (kompiuteryje): „Išsaugoti kaip PDF“"
              onClick={() => {
                onClose();
                void printCv(doc, mode);
              }}
            >
              Spausdinti…
            </button>
          )}
          <button type="button" className="btn" onClick={onClose}>
            Uždaryti
          </button>
        </div>
      </div>
    </div>
  );
}

function describe(r: PdfResult) {
  const pages = r.pages === 1 ? '1 puslapis' : `${r.pages} psl.`;
  const size = `210 × ${Math.round(r.heightMm)} mm`;
  return r.scale < 1 ? `${pages} · ${size} · mastelis ${Math.round(r.scale * 100)} %` : `${pages} · ${size}`;
}
