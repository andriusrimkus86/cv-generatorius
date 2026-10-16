import { useState } from 'react';
import { KIND_LABELS, newSection, PLACEMENT_LABELS } from '../model/defaults';
import type { Placement, Section, SectionKind } from '../model/types';
import { useEditorStore } from '../store/useEditorStore';
import { ItemControls } from '../ui/ItemControls';
import { SortableList } from '../ui/SortableList';
import { IconDown, IconPlus, IconRight } from '../ui/icons';
import { TextAreaField, TextField } from './fields';
import { BulletsEditor, KeyValueEditor, TagsEditor } from './ListEditors';
import { TimelineEditor } from './TimelineEditor';

const ADDABLE_KINDS: SectionKind[] = ['tags', 'list', 'text', 'keyValue', 'timeline', 'personal', 'licence'];

export function SectionsPanel({ sections }: { sections: Section[] }) {
  const update = useEditorStore((s) => s.update);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const patchSection = (id: string, fn: (s: Section) => void) =>
    update((d) => {
      const s = d.sections.find((x) => x.id === id);
      if (s) fn(s);
    });

  return (
    <div className="form-stack">
      <SortableList
        items={sections}
        onReorder={(next) =>
          update((d) => {
            d.sections = next;
          })
        }
        className="card-list"
        renderItem={(s, c) => {
          const isOpen = open.has(s.id);
          return (
            <div className={s.hidden ? 'sub-card is-hidden' : 'sub-card'}>
              <div className="sub-card-head">
                <button type="button" className="sub-card-toggle" aria-expanded={isOpen} onClick={() => toggle(s.id)}>
                  {isOpen ? <IconDown /> : <IconRight />}
                  <span className="sub-card-summary">
                    <strong>{s.title || 'Be pavadinimo'}</strong>
                    <small>{PLACEMENT_LABELS[s.placement]}</small>
                  </span>
                </button>
                <ItemControls
                  controls={c}
                  hidden={s.hidden}
                  onToggleHidden={() => patchSection(s.id, (x) => (x.hidden = !x.hidden))}
                  onDelete={() =>
                    update((d) => {
                      d.sections = d.sections.filter((x) => x.id !== s.id);
                    })
                  }
                  confirmDelete={`Ištrinti sekciją „${s.title}“ su visu turiniu?`}
                />
              </div>
              {isOpen && (
                <div className="sub-card-body">
                  <div className="form-grid">
                    <TextField label="Antraštė" value={s.title} onChange={(v) => patchSection(s.id, (x) => (x.title = v))} />
                    <PlacementSelect
                      value={s.placement}
                      onChange={(v) => patchSection(s.id, (x) => (x.placement = v))}
                    />
                  </div>
                  <SectionBody section={s} patch={(fn) => patchSection(s.id, fn)} />
                </div>
              )}
            </div>
          );
        }}
      />

      {adding ? (
        <AddSectionForm
          onCancel={() => setAdding(false)}
          onAdd={(kind, title, placement) => {
            const s = newSection(kind, title, placement);
            update((d) => {
              d.sections.push(s);
            });
            setOpen((prev) => new Set(prev).add(s.id));
            setAdding(false);
          }}
        />
      ) : (
        <button type="button" className="btn" onClick={() => setAdding(true)}>
          <IconPlus /> Pridėti sekciją
        </button>
      )}
    </div>
  );
}

function PlacementSelect({ value, onChange }: { value: Placement; onChange: (v: Placement) => void }) {
  return (
    <label className="field">
      <span className="field-label">Vieta</span>
      <select value={value} onChange={(e) => onChange(e.target.value as Placement)}>
        {(Object.keys(PLACEMENT_LABELS) as Placement[]).map((p) => (
          <option key={p} value={p}>
            {PLACEMENT_LABELS[p]}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionBody({ section: s, patch }: { section: Section; patch: (fn: (s: Section) => void) => void }) {
  switch (s.kind) {
    case 'text':
      return (
        <TextAreaField
          label="Tekstas"
          value={s.text}
          minRows={4}
          onChange={(v) => patch((x) => x.kind === 'text' && (x.text = v))}
        />
      );
    case 'tags':
      return <TagsEditor items={s.items} onChange={(items) => patch((x) => x.kind === 'tags' && (x.items = items))} />;
    case 'list':
      return <BulletsEditor items={s.items} onChange={(items) => patch((x) => x.kind === 'list' && (x.items = items))} />;
    case 'keyValue':
      return (
        <KeyValueEditor items={s.items} onChange={(items) => patch((x) => x.kind === 'keyValue' && (x.items = items))} />
      );
    case 'timeline':
      return (
        <TimelineEditor items={s.items} onChange={(items) => patch((x) => x.kind === 'timeline' && (x.items = items))} />
      );
    case 'personal':
      return <p className="hint">Rodo gimimo datą, šeimyninę padėtį ir papildomus laukus iš „Asmeninė informacija“.</p>;
    case 'licence':
      return <p className="hint">Rodo vairuotojo pažymėjimo kategorijas iš „Asmeninė informacija“.</p>;
  }
}

function AddSectionForm({
  onAdd,
  onCancel,
}: {
  onAdd: (kind: SectionKind, title: string, placement: Placement) => void;
  onCancel: () => void;
}) {
  const [kind, setKind] = useState<SectionKind>('tags');
  const [title, setTitle] = useState('');
  const [placement, setPlacement] = useState<Placement>('sidebar');
  return (
    <form
      className="sub-card add-section"
      onSubmit={(e) => {
        e.preventDefault();
        onAdd(kind, title.trim() || KIND_LABELS[kind].replace(/ \(.*\)$/, ''), placement);
      }}
    >
      <h3>Nauja sekcija</h3>
      <TextField label="Antraštė" value={title} placeholder="pvz. Kalbos, Sertifikatai" onChange={setTitle} autoFocus />
      <div className="form-grid">
        <label className="field">
          <span className="field-label">Tipas</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as SectionKind)}>
            {ADDABLE_KINDS.map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
        <PlacementSelect value={placement} onChange={setPlacement} />
      </div>
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onCancel}>
          Atšaukti
        </button>
        <button type="submit" className="btn btn-primary">
          Pridėti
        </button>
      </div>
    </form>
  );
}
