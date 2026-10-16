import type { CSSProperties } from 'react';
import { contactItems } from '../common';
import { HtmlSections } from '../shared/HtmlSections';
import type { TemplateProps } from '../types';
import './minimal.css';

/** Kairės (šoninės) skilties plotis. */
export const MINIMAL_ASIDE_WIDTH = '58mm';

/**
 * „Minimalus“: baltas lapas, vardas viršuje su plona akcento linija,
 * siaura skiltis kairėje ir pagrindinė dalis dešinėje, atskirtos plona linija.
 */
export function MinimalTemplate({ data, theme }: TemplateProps) {
  const { personal } = data;
  const vars = {
    '--cvn-aside-w': MINIMAL_ASIDE_WIDTH,
    '--cvn-accent': theme.accent,
    '--cvn-text': theme.text,
    '--cvn-muted': theme.muted,
    '--cvn-line': theme.line,
  } as CSSProperties;
  const contacts = contactItems(data);

  return (
    <div className="cv-sheet cv-minimal" style={vars}>
      <header className="cvn-header">
        <div className="cvn-header-text">
          <h1 className="cvn-name">
            {personal.firstName} {personal.lastName}
          </h1>
          {contacts.length > 0 && (
            <ul className="cvn-contacts">
              {contacts.map((c) => (
                <li key={c.kind}>{c.value}</li>
              ))}
            </ul>
          )}
        </div>
        {personal.photo && <img className="cvn-photo" src={personal.photo} alt="" />}
      </header>
      <div className="cvn-body">
        <aside className="cvn-aside">
          <HtmlSections data={data} placement="sidebar" />
        </aside>
        <main className="cvn-main">
          <HtmlSections data={data} placement="main" />
        </main>
      </div>
    </div>
  );
}
