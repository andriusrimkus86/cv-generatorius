import { useState } from 'react';
import { formatPeriod } from '../model/dates';
import { newTimelineItem } from '../model/defaults';
import type { TimelineItem } from '../model/types';
import { ItemControls } from '../ui/ItemControls';
import { SortableList } from '../ui/SortableList';
import { IconDown, IconPlus, IconRight } from '../ui/icons';
import { MonthYearPicker, TextField } from './fields';
import { BulletsEditor } from './ListEditors';

export function TimelineEditor({
  items,
  onChange,
  orgLabel = 'Įmonė / įstaiga',
  titleLabel = 'Pareigos / laipsnis',
}: {
  items: TimelineItem[];
  onChange: (items: TimelineItem[]) => void;
  orgLabel?: string;
  titleLabel?: string;
}) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const patch = (id: string, p: Partial<TimelineItem>) => onChange(items.map((x) => (x.id === id ? { ...x, ...p } : x)));

  return (
    <div className="list-editor">
      <SortableList
        items={items}
        onReorder={onChange}
        className="card-list"
        renderItem={(it, c) => {
          const isOpen = open.has(it.id);
          const period = formatPeriod(it);
          return (
            <div className={it.hidden ? 'sub-card is-hidden' : 'sub-card'}>
              <div className="sub-card-head">
                <button type="button" className="sub-card-toggle" aria-expanded={isOpen} onClick={() => toggle(it.id)}>
                  {isOpen ? <IconDown /> : <IconRight />}
                  <span className="sub-card-summary">
                    <strong>{it.title || 'Naujas įrašas'}</strong>
                    <small>{[it.org, period].filter(Boolean).join(' · ')}</small>
                  </span>
                </button>
                <ItemControls
                  controls={c}
                  hidden={it.hidden}
                  onToggleHidden={() => patch(it.id, { hidden: !it.hidden })}
                  onDelete={() => onChange(items.filter((x) => x.id !== it.id))}
                  confirmDelete={`Ištrinti įrašą „${it.title || it.org || 'be pavadinimo'}“?`}
                />
              </div>
              {isOpen && (
                <div className="sub-card-body">
                  <TextField label={titleLabel} value={it.title} onChange={(title) => patch(it.id, { title })} />
                  <TextField label={orgLabel} value={it.org} onChange={(org) => patch(it.id, { org })} />
                  <div className="date-grid">
                    <MonthYearPicker label="Pradžia" value={it.start} onChange={(start) => patch(it.id, { start })} />
                    <div>
                      <MonthYearPicker
                        label="Pabaiga"
                        value={it.end === 'present' ? undefined : it.end}
                        disabled={it.end === 'present'}
                        onChange={(end) => patch(it.id, { end })}
                      />
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={it.end === 'present'}
                          onChange={(e) => patch(it.id, { end: e.target.checked ? 'present' : undefined })}
                        />
                        Dabar
                      </label>
                    </div>
                  </div>
                  <div className="field">
                    <span className="field-label">Aprašymo punktai</span>
                    <BulletsEditor items={it.bullets} onChange={(bullets) => patch(it.id, { bullets })} />
                  </div>
                </div>
              )}
            </div>
          );
        }}
      />
      <button
        type="button"
        className="btn btn-small"
        onClick={() => {
          const item = newTimelineItem();
          onChange([item, ...items]);
          setOpen((prev) => new Set(prev).add(item.id));
        }}
      >
        <IconPlus /> Naujas įrašas (viršuje)
      </button>
    </div>
  );
}
