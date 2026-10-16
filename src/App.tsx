import { useEffect, useState, type ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ensureSeeded } from './db/repo';
import { PrintTest } from './dev/PrintTest';
import { EditorPage } from './editor/EditorPage';
import { ProfilesPage } from './profiles/ProfilesPage';

// HashRouter: statiniame hostinge (GitHub Pages) nereikia serverio nukreipimų.
export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<DbReady><ProfilesPage /></DbReady>} />
        <Route path="/d/:docId" element={<DbReady><EditorPage /></DbReady>} />
        {import.meta.env.DEV && <Route path="/dev/print" element={<PrintTest />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

/** Rodo turinį tik paruošus duomenų bazę (pirmą kartą sukuriamas pradinis profilis). */
function DbReady({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureSeeded()
      .then(() => setReady(true))
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <div className="page-center">Nepavyko atidaryti duomenų bazės: {error}</div>;
  if (!ready) return <div className="page-center">Įkeliama…</div>;
  return children;
}
