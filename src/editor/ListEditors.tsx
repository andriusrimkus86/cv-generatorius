import { useState } from 'react';
import { newBullet, newKeyValue, newTag } from '../model/defaults';
import type { Bullet, KeyValue, Tag } from '../model/types';
import { ItemControls } from '../ui/ItemControls';
import { SortableList } from '../ui/SortableList';
import { IconPlus } from '../ui/icons';
import { AutoTextarea } from './fields';

const replace = <T extends { id: string }>(items: T[], id: string, patch: Partial<T>) =>
  items.map((x) => (x.id === id ? { ...x, ...patch } : x));
const remove = <T extends { id: string }>(items: T[], id: string) => items.filter((x) => x.id !== id);

/** Aprašymo punktai (kelių eilučių). */
export function BulletsEditor({
  items,
  onChange,
  addLabel = 'Punktas',
}: {
  items: Bullet[];
  onChange: (items: Bullet[]) => void;
  addLabel?: string;
}) {
  return (
    <div className="list-editor">
      <SortableList
        items={items}
        onReorder={onChange}
        className="list-rows"
        renderItem={(b, c) => (
          <div className={b.hidden ? 'list-row is-hidden' : 'list-row'}>
            <AutoTextarea
              value={b.text}
              ariaLabel={`Punktas ${c.index + 1}`}
              minRows={1}
              onChange={(text) => onChange(replace(items, b.id, { text }))}
            />
            <ItemControls
              controls={c}
              hidden={b.hidden}
              onToggleHidden={() => onChange(replace(items, b.id, { hidden: !b.hidden }))}
              onDelete={() => onChange(remove(items, b.id))}
            />
          </div>
        )}
      />
      <button type="button" className="btn btn-small" onClick={() => onChange([...items, newBullet()])}>
        <IconPlus /> {addLabel}
      </button>
    </div>
  );
}

/** Žymos (pvz. įgūdžiai): vienos eilutės įrašai ir greitas pridėjimas su Enter. */
export function TagsEditor({ items, onChange }: { items: Tag[]; onChange: (items: Tag[]) => void }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const text = draft.trim();
    if (!text) return;
    onChange([...items, newTag(text)]);
    setDraft('');
  };
  return (
    <div className="list-editor">
      <SortableList
        items={items}
        onReorder={onChange}
        className="list-rows"
        renderItem={(t, c) => (
          <div className={t.hidden ? 'list-row is-hidden' : 'list-row'}>
            <input
              value={t.text}
              aria-label={`Žyma ${c.index + 1}`}
              onChange={(e) => onChange(replace(items, t.id, { text: e.target.value }))}
            />
            <ItemControls
              controls={c}
              hidden={t.hidden}
              onToggleHidden={() => onChange(replace(items, t.id, { hidden: !t.hidden }))}
              onDelete={() => onChange(remove(items, t.id))}
            />
          </div>
        )}
      />
      <div className="add-row">
        <input
          value={draft}
          placeholder="Nauja žyma…"
          aria-label="Nauja žyma"
          enterKeyHint="done"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn btn-small" onClick={add} disabled={!draft.trim()}>
          <IconPlus /> Pridėti
        </button>
      </div>
    </div>
  );
}

/** „Pavadinimas: reikšmė" įrašai. */
export function KeyValueEditor({ items, onChange }: { items: KeyValue[]; onChange: (items: KeyValue[]) => void }) {
  return (
    <div className="list-editor">
      <SortableList
        items={items}
        onReorder={onChange}
        className="list-rows"
        renderItem={(kv, c) => (
          <div className={kv.hidden ? 'list-row kv-row is-hidden' : 'list-row kv-row'}>
            <div className="kv-inputs">
              <input
                value={kv.label}
                placeholder="Pavadinimas"
                aria-label="Pavadinimas"
                onChange={(e) => onChange(replace(items, kv.id, { label: e.target.value }))}
              />
              <input
                value={kv.value}
                placeholder="Reikšmė"
                aria-label="Reikšmė"
                onChange={(e) => onChange(replace(items, kv.id, { value: e.target.value }))}
              />
            </div>
            <ItemControls
              controls={c}
              hidden={kv.hidden}
              onToggleHidden={() => onChange(replace(items, kv.id, { hidden: !kv.hidden }))}
              onDelete={() => onChange(remove(items, kv.id))}
            />
          </div>
        )}
      />
      <button type="button" className="btn btn-small" onClick={() => onChange([...items, newKeyValue()])}>
        <IconPlus /> Laukas
      </button>
    </div>
  );
}
