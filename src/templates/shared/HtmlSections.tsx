import type { ReactNode } from 'react';
import { formatPeriod } from '../../model/dates';
import type { Bullet, CvData, KeyValue, Placement, Section, TimelineItem } from '../../model/types';
import { licenceFields, nonEmpty, personalFields, visible } from '../common';

/*
 * Bendras sekcijų žymėjimas (klasės „cvx-*“) šablonams „Modernus“ ir „Minimalus“.
 * Kiekvienas šablonas jį stilizuoja savo CSS faile (pvz. `.cv-modern .cvx-tags`).
 */

/** Visos matomos nurodytos vietos sekcijos su antraštėmis. Tuščios sekcijos praleidžiamos. */
export function HtmlSections({ data, placement }: { data: CvData; placement: Placement }) {
  return (
    <>
      {visible(data.sections)
        .filter((s) => s.placement === placement)
        .map((s) => {
          const body = sectionBody(s, data, placement);
          if (!body) return null;
          return (
            <section key={s.id} className={`cvx-section cvx-kind-${s.kind}`}>
              <h2 className="cvx-heading">{s.title}</h2>
              {body}
            </section>
          );
        })}
    </>
  );
}

function sectionBody(s: Section, data: CvData, placement: Placement): ReactNode {
  switch (s.kind) {
    case 'text':
      return s.text.trim() ? <p className="cvx-text">{s.text}</p> : null;
    case 'tags': {
      const tags = visible(s.items);
      if (!tags.length) return null;
      return (
        <ul className="cvx-tags">
          {tags.map((t) => (
            <li key={t.id}>{t.text}</li>
          ))}
        </ul>
      );
    }
    case 'list':
      return bullets(visible(s.items));
    case 'keyValue':
      return keyValues(visible(s.items));
    case 'personal':
      return keyValues(personalFields(data));
    case 'licence':
      return keyValues(licenceFields(data));
    case 'timeline': {
      const items = visible(s.items);
      if (!items.length) return null;
      return (
        <div className={placement === 'main' ? 'cvx-tl' : 'cvx-tl cvx-tl-compact'}>
          {items.map((it) => (
            <TimelineEntry key={it.id} item={it} />
          ))}
        </div>
      );
    }
  }
}

function keyValues(items: KeyValue[]) {
  const shown = nonEmpty(items);
  if (!shown.length) return null;
  return (
    <dl className="cvx-kv">
      {shown.map((kv) => (
        <div key={kv.id} className="cvx-kv-row">
          <dt className="cvx-kv-label">{kv.label}</dt>
          <dd className="cvx-kv-value">{kv.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function bullets(items: Bullet[]) {
  if (!items.length) return null;
  return (
    <ul className="cvx-bullets">
      {items.map((b) => (
        <li key={b.id}>{b.text}</li>
      ))}
    </ul>
  );
}

function TimelineEntry({ item }: { item: TimelineItem }) {
  const period = formatPeriod(item);
  return (
    <div className="cvx-tl-item">
      <div className="cvx-tl-date">{period}</div>
      <div className="cvx-tl-title">{item.title}</div>
      {item.org && <div className="cvx-tl-org">{item.org}</div>}
      {bullets(visible(item.bullets))}
    </div>
  );
}
