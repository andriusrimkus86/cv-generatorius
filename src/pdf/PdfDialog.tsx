import { useEffect, useState } from 'react';
import type { CvDocument } from '../model/types';
import { printCv } from '../preview/print';
import { IconDownload, IconPdf } from '../ui/icons';
import { canShareFile, downloadFile, generatePdf, shareFile } from './generatePdf';

type State = { kind: 'working' } | { kind: 'ready'; file: File; url: string } | { kind: 'error'; message: string };

/** PDF paruošimas ir veiksmai: atsisiųsti, dalintis (telefone), atidaryti, spausdinti. */
export function PdfDialog({ doc, onClose }: { doc: CvDocument; onClose: () => void }) {
  const [state, setState] = useState<State>({ kind: 'working' });

  useEffect(() => {
    let url: string | undefined;
    let alive = true;
    generatePdf(doc)
      .then((file) => {
        url = URL.createObjectURL(file);
        if (alive) setState({ kind: 'ready', file, url });
      })
      .catch((e: Error) => {
        console.error(e);
        if (alive) setState({ kind: 'error', message: e.message });
      });
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
    // PDF generuojamas vieną kartą atidarius langą.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="PDF" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>PDF failas</h3>

        {state.kind === 'working' && <p className="hint">Ruošiamas PDF…</p>}

        {state.kind === 'error' && (
          <p className="notice error">Nepavyko sukurti PDF: {state.message}</p>
        )}

        {state.kind === 'ready' && (
          <>
            <p className="hint">
              {state.file.name} · {Math.max(1, Math.round(state.file.size / 1024))} KB
            </p>
            <div className="pdf-actions">
              <button type="button" className="btn btn-primary" onClick={() => downloadFile(state.file)}>
                <IconDownload /> Atsisiųsti
              </button>
              {canShareFile(state.file) && (
                <button type="button" className="btn" onClick={() => shareFile(state.file)}>
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
          <button
            type="button"
            className="btn btn-small"
            title="Naršyklės spausdinimo langas (kompiuteryje)"
            onClick={() => {
              onClose();
              void printCv(doc);
            }}
          >
            Spausdinti…
          </button>
          <button type="button" className="btn" onClick={onClose}>
            Uždaryti
          </button>
        </div>
      </div>
    </div>
  );
}
