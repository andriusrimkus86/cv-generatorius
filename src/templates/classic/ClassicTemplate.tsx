import type { CSSProperties, ReactNode } from 'react';
import { formatPeriod } from '../../model/dates';
import type { CvData, KeyValue, Placement, Section, TimelineItem } from '../../model/types';
import { contactItems, licenceFields, nonEmpty, personalFields, visible } from '../common';
import type { TemplateProps } from '../types';
import { MailIcon, PhoneIcon, PinIcon } from './icons';
import './classic.css';

export const CLASSIC_SIDEBAR_WIDTH = '67mm';

export function ClassicTemplate({ data, theme }: TemplateProps) {
  const { personal } = data;
  const sections = visible(data.sections);
  const vars = {
    '--cvc-sidebar-w': CLASSIC_SIDEBAR_WIDTH,
    '--cvc-sidebar-bg': theme.sidebarBg,
    '--cvc-sidebar-text': theme.sidebarText,
    '--cvc-sidebar-strong': theme.sidebarStrong,
    '--cvc-sidebar-line': theme.sidebarLine,
    '--cvc-accent': theme.accent,
    '--cvc-text': theme.text,
    '--cvc-muted': theme.muted,
    '--cvc-line': theme.line,
  } as CSSProperties;

  const icons = { address: <PinIcon />, phone: <PhoneIcon />, email: <MailIcon /> };
  const contacts = contactItems(data).map((c) => ({ icon: icons[c.kind], value: c.value }));

  const render = (placement: Placement) =>
    sections
      .filter((s) => s.placement === placement)
      .map((s) => {
        const body = renderSectionBody(s, data, placement);
        if (!body) return null;
        return (
          <section key={s.id} className={`cvc-section cvc-kind-${s.kind}`}>
            <h2 className="cvc-heading">{s.title}</h2>
            {body}
          </section>
        );
      });

  return (
    <div className="cv-classic" style={vars}>
      <aside className="cvc-sidebar">
        {personal.photo && <img className="cvc-photo" src={personal.photo} alt="" />}
        {render('sidebar')}
      </aside>
      <main className="cvc-main">
        <header className="cvc-header">
          <h1 className="cvc-name">
            <span>{personal.firstName}</span>
            <span>{personal.lastName}</span>
          </h1>
          {contacts.length > 0 && (
            <ul className="cvc-contacts">
              {contacts.map((c, i) => (
                <li key={i}>
                  <span className="cvc-contact-icon">{c.icon}</span>
                  <span>{c.value}</span>
                </li>
              ))}
            </ul>
          )}
        </header>
        {render('main')}
      </main>
    </div>
  );
}

/** Grąžina sekcijos turinį arba null, jei nėra ką rodyti (tada nerodoma ir antraštė). */
function renderSectionBody(s: Section, data: CvData, placement: Placement): ReactNode {
  switch (s.kind) {
    case 'text':
      return s.text.trim() ? <p className="cvc-text">{s.text}</p> : null;

    case 'tags': {
      const tags = visible(s.items);
      if (!tags.length) return null;
      return (
        <ul className="cvc-tags">
          {tags.map((t) => (
            <li key={t.id}>{t.text}</li>
          ))}
        </ul>
      );
    }

    case 'list': {
      const items = visible(s.items);
      if (!items.length) return null;
      return (
        <ul className="cvc-bullets">
          {items.map((b) => (
            <li key={b.id}>{b.text}</li>
          ))}
        </ul>
      );
    }

    case 'keyValue':
      return renderKeyValues(visible(s.items));

    case 'personal':
      return renderKeyValues(personalFields(data));

    case 'licence':
      return renderKeyValues(licenceFields(data));

    case 'timeline': {
      const items = visible(s.items);
      if (!items.length) return null;
      return placement === 'main' ? (
        <div className="cvc-timeline">
          {items.map((it) => (
            <TimelineRow key={it.id} item={it} />
          ))}
        </div>
      ) : (
        <div className="cvc-timeline-compact">
          {items.map((it) => (
            <div key={it.id} className="cvc-tl-compact-item">
              <div className="cvc-kv-label">{it.title}</div>
              <div>{[it.org, formatPeriod(it)].filter(Boolean).join(', ')}</div>
              {renderBullets(it)}
            </div>
          ))}
        </div>
      );
    }
  }
}

function renderKeyValues(items: KeyValue[]) {
  const shown = nonEmpty(items);
  if (!shown.length) return null;
  return (
    <dl className="cvc-kv">
      {shown.map((kv) => (
        <div key={kv.id} className="cvc-kv-row">
          <dt className="cvc-kv-label">{kv.label}</dt>
          <dd>{kv.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function renderBullets(item: TimelineItem) {
  const bullets = visible(item.bullets);
  if (!bullets.length) return null;
  return (
    <ul className="cvc-bullets">
      {bullets.map((b) => (
        <li key={b.id}>{b.text}</li>
      ))}
    </ul>
  );
}

function TimelineRow({ item }: { item: TimelineItem }) {
  const period = formatPeriod(item);
  return (
    <div className="cvc-tl-item">
      <div className="cvc-tl-left">
        <div className="cvc-tl-org">{item.org}</div>
        {period && <div className="cvc-tl-date">{period}</div>}
      </div>
      <div className="cvc-tl-rail" />
      <div className="cvc-tl-right">
        <div className="cvc-tl-title">{item.title}</div>
        {renderBullets(item)}
      </div>
    </div>
  );
}
