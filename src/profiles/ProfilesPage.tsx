import { useLiveQuery } from 'dexie-react-hooks';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import { createProfile, deleteProfile, duplicateProfile, renameProfile } from '../db/repo';
import { exportProfiles, importProfiles } from '../io/json';
import type { Profile } from '../model/types';
import { IconCopy, IconDownload, IconEdit, IconPlus, IconTrash, IconUpload } from '../ui/icons';
import './profiles.css';

const fmt = new Intl.DateTimeFormat('lt-LT', { dateStyle: 'medium', timeStyle: 'short' });

export function ProfilesPage() {
  const navigate = useNavigate();
  const profiles = useLiveQuery(() => db.profiles.orderBy('updatedAt').reverse().toArray(), []);
  const docCounts = useLiveQuery(async () => {
    const counts = new Map<string, number>();
    await db.documents.each((d) => counts.set(d.profileId, (counts.get(d.profileId) ?? 0) + 1));
    return counts;
  }, []);
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const open = (p: Profile) => navigate(`/d/${p.activeDocId}`);

  const create = async () => {
    const name = window.prompt('Naujo profilio pavadinimas (pvz. vardas ir pavardė):');
    if (!name?.trim()) return;
    open(await createProfile(name.trim()));
  };

  const doImport = async (file?: File) => {
    if (!file) return;
    try {
      const n = await importProfiles(await file.text());
      setMessage({ kind: 'ok', text: `Importuota profilių: ${n}.` });
    } catch (e) {
      setMessage({ kind: 'error', text: (e as Error).message });
    }
  };

  return (
    <div className="profiles-page">
      <header className="app-bar">
        <div className="app-bar-title">
          <strong>CV generatorius</strong>
        </div>
      </header>

      <main className="profiles-main">
        <div className="profiles-head">
          <h1>Profiliai</h1>
          <button type="button" className="btn btn-primary" onClick={create}>
            <IconPlus /> Naujas profilis
          </button>
        </div>

        {message && (
          <p className={`notice ${message.kind}`} role="status">
            {message.text}
            <button type="button" className="notice-close" aria-label="Uždaryti" onClick={() => setMessage(null)}>
              ×
            </button>
          </p>
        )}

        <ul className="profile-list">
          {profiles?.map((p) => (
            <li key={p.id} className="profile-card">
              <button type="button" className="profile-open" onClick={() => open(p)}>
                <strong>{p.name}</strong>
                <small>
                  Versijų: {docCounts?.get(p.id) ?? 0} · keista {fmt.format(p.updatedAt)}
                </small>
              </button>
              <div className="profile-actions">
                <button
                  type="button"
                  className="icon-btn"
                  title="Pervadinti"
                  onClick={async () => {
                    const name = window.prompt('Profilio pavadinimas:', p.name);
                    if (name?.trim()) await renameProfile(p.id, name.trim());
                  }}
                >
                  <IconEdit />
                </button>
                <button type="button" className="icon-btn" title="Dublikuoti" onClick={() => duplicateProfile(p.id)}>
                  <IconCopy />
                </button>
                <button type="button" className="icon-btn" title="Eksportuoti (JSON)" onClick={() => exportProfiles([p.id])}>
                  <IconDownload />
                </button>
                <button
                  type="button"
                  className="icon-btn danger"
                  title="Ištrinti"
                  onClick={async () => {
                    if (window.confirm(`Ištrinti profilį „${p.name}“ ir visas jo CV versijas? To atšaukti negalima.`))
                      await deleteProfile(p.id);
                  }}
                >
                  <IconTrash />
                </button>
              </div>
            </li>
          ))}
          {profiles?.length === 0 && <li className="empty">Profilių dar nėra. Sukurkite naują arba importuokite JSON.</li>}
        </ul>

        <section className="panel backup-panel">
          <h2>Atsarginė kopija ir perkėlimas</h2>
          <p className="hint">
            Duomenys saugomi tik šiame įrenginyje (naršyklėje). Norėdami perkelti juos į telefoną ar kompiuterį,
            eksportuokite JSON failą ir importuokite jį kitame įrenginyje.
          </p>
          <div className="backup-actions">
            <button type="button" className="btn" onClick={() => exportProfiles()} disabled={!profiles?.length}>
              <IconDownload /> Eksportuoti visus
            </button>
            <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
              <IconUpload /> Importuoti JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                void doImport(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
