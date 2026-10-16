import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { db } from '../db/db';
import { deleteDocument, duplicateDocument, renameDocument, setActiveDocument } from '../db/repo';
import { exportProfiles } from '../io/json';
import { PreviewPane } from '../preview/PreviewPane';
import { PrintRoot } from '../preview/PrintRoot';
import { PdfDialog } from '../pdf/PdfDialog';
import { useEditorStore } from '../store/useEditorStore';
import { THEMES } from '../templates/themes';
import { IconBack, IconCopy, IconDownload, IconEdit, IconPdf, IconTrash } from '../ui/icons';
import { PersonalForm } from './PersonalForm';
import { SectionsPanel } from './SectionsPanel';
import './editor.css';

type Tab = 'edit' | 'preview';

export function EditorPage() {
  const { docId = '' } = useParams();
  const navigate = useNavigate();
  const doc = useEditorStore((s) => s.doc);
  const saving = useEditorStore((s) => s.saving);
  const load = useEditorStore((s) => s.load);
  const setDocFields = useEditorStore((s) => s.setDocFields);
  const [missing, setMissing] = useState(false);
  const [tab, setTab] = useState<Tab>('edit');
  const [personalOpen, setPersonalOpen] = useState(true);
  const [pdfOpen, setPdfOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    load(docId).then((ok) => alive && setMissing(!ok));
    return () => {
      alive = false;
    };
  }, [docId, load]);

  const profile = useLiveQuery(() => (doc ? db.profiles.get(doc.profileId) : undefined), [doc?.profileId]);
  const versions = useLiveQuery(
    () => (doc ? db.documents.where('profileId').equals(doc.profileId).toArray() : []),
    [doc?.profileId, doc?.name],
  );

  if (missing) {
    return (
      <div className="page-center">
        <p>CV nerastas.</p>
        <Link className="btn" to="/">
          Į profilių sąrašą
        </Link>
      </div>
    );
  }
  if (!doc || doc.id !== docId) return <div className="page-center">Įkeliama…</div>;

  const switchVersion = async (id: string) => {
    await setActiveDocument(doc.profileId, id);
    navigate(`/d/${id}`);
  };

  const newVersion = async () => {
    const name = window.prompt('Naujos versijos pavadinimas (bus nukopijuota dabartinė):', `${doc.name} (kopija)`);
    if (!name?.trim()) return;
    await useEditorStore.getState().flush();
    const created = await duplicateDocument(doc.id, name.trim());
    if (created) navigate(`/d/${created.id}`);
  };

  const rename = async () => {
    const name = window.prompt('Versijos pavadinimas:', doc.name);
    if (!name?.trim()) return;
    setDocFields({ name: name.trim() });
    await renameDocument(doc.id, name.trim());
  };

  const remove = async () => {
    if (!window.confirm(`Ištrinti versiją „${doc.name}“?`)) return;
    const next = await deleteDocument(doc.id);
    if (next) navigate(`/d/${next}`);
  };

  const exportProfile = async () => {
    await useEditorStore.getState().flush();
    await exportProfiles([doc.profileId]);
  };

  return (
    <div className={`editor-page tab-${tab}`}>
      <header className="app-bar">
        <Link className="icon-btn on-dark" to="/" title="Profiliai" aria-label="Atgal į profilius">
          <IconBack />
        </Link>
        <div className="app-bar-title">
          <strong>{profile?.name ?? ''}</strong>
          <small className={`save-status ${saving}`}>
            {saving === 'pending' ? 'Saugoma…' : saving === 'error' ? 'Klaida saugant!' : 'Išsaugota'}
          </small>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setPdfOpen(true)}>
          <IconPdf /> <span className="hide-xs">Išsaugoti</span> PDF
        </button>
      </header>

      <nav className="editor-tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'edit'} onClick={() => setTab('edit')}>
          Redaguoti
        </button>
        <button role="tab" aria-selected={tab === 'preview'} onClick={() => setTab('preview')}>
          Peržiūra
        </button>
      </nav>

      <div className="editor-layout">
        <div className="editor-forms">
          <section className="panel">
            <div className="version-bar">
              <label className="field">
                <span className="field-label">CV versija</span>
                <select value={doc.id} onChange={(e) => switchVersion(e.target.value)}>
                  {(versions ?? [doc]).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.id === doc.id ? doc.name : v.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="version-actions">
                <button type="button" className="icon-btn" title="Nauja versija (kopija)" onClick={newVersion}>
                  <IconCopy />
                </button>
                <button type="button" className="icon-btn" title="Pervadinti versiją" onClick={rename}>
                  <IconEdit />
                </button>
                <button
                  type="button"
                  className="icon-btn danger"
                  title="Ištrinti versiją"
                  disabled={(versions?.length ?? 1) < 2}
                  onClick={remove}
                >
                  <IconTrash />
                </button>
                <button type="button" className="icon-btn" title="Eksportuoti profilį (JSON)" onClick={exportProfile}>
                  <IconDownload />
                </button>
              </div>
            </div>
            {THEMES.length > 1 && (
              <label className="field">
                <span className="field-label">Spalvų tema</span>
                <select value={doc.themeId} onChange={(e) => setDocFields({ themeId: e.target.value })}>
                  {THEMES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </section>

          <section className="panel">
            <button
              type="button"
              className="panel-toggle"
              aria-expanded={personalOpen}
              onClick={() => setPersonalOpen((v) => !v)}
            >
              <h2>Asmeninė informacija</h2>
              <span aria-hidden="true">{personalOpen ? '−' : '+'}</span>
            </button>
            {personalOpen && <PersonalForm personal={doc.data.personal} />}
          </section>

          <section className="panel">
            <h2>Sekcijos</h2>
            <p className="hint">Tempkite už ⋮⋮ arba naudokite rodykles, kad pakeistumėte tvarką. Akutė paslepia sekciją CV.</p>
            <SectionsPanel sections={doc.data.sections} />
          </section>
        </div>

        <div className="editor-preview">
          <PreviewPane doc={doc} />
        </div>
      </div>

      <PrintRoot doc={doc} />
      {pdfOpen && <PdfDialog doc={doc} onClose={() => setPdfOpen(false)} />}
    </div>
  );
}
