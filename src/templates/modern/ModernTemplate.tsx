import type { CSSProperties } from 'react';
import { contactItems, mixColor } from '../common';
import { MailIcon, PhoneIcon, PinIcon } from '../classic/icons';
import { HtmlSections } from '../shared/HtmlSections';
import type { Theme, TemplateProps } from '../types';
import './modern.css';

/** Dešinės (šoninės) skilties plotis. */
export const MODERN_ASIDE_WIDTH = '64mm';

/** Šviesus šoninės skilties fonas, išvestas iš temos spalvos. */
export const modernTint = (t: Theme) => mixColor(t.sidebarBg, '#ffffff', 0.92);

/**
 * „Modernus“: tamsi antraštės juosta per visą plotį su nuotrauka ir kontaktais,
 * po ja pagrindinė skiltis kairėje ir šviesi šoninė skiltis dešinėje.
 */
export function ModernTemplate({ data, theme }: TemplateProps) {
  const { personal } = data;
  const vars = {
    '--cvm-aside-w': MODERN_ASIDE_WIDTH,
    '--cvm-band': theme.sidebarBg,
    '--cvm-band-text': theme.sidebarText,
    '--cvm-band-strong': theme.sidebarStrong,
    '--cvm-tint': modernTint(theme),
    '--cvm-accent': theme.accent,
    '--cvm-text': theme.text,
    '--cvm-muted': theme.muted,
    '--cvm-line': theme.line,
  } as CSSProperties;
  const icons = { address: <PinIcon />, phone: <PhoneIcon />, email: <MailIcon /> };
  const contacts = contactItems(data);

  return (
    <div className="cv-sheet cv-modern" style={vars}>
      <header className="cvm-band">
        {personal.photo && <img className="cvm-photo" src={personal.photo} alt="" />}
        <div className="cvm-band-text">
          <h1 className="cvm-name">
            {personal.firstName} {personal.lastName}
          </h1>
          {contacts.length > 0 && (
            <ul className="cvm-contacts">
              {contacts.map((c) => (
                <li key={c.kind}>
                  <span className="cvm-contact-icon">{icons[c.kind]}</span>
                  {c.value}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>
      <div className="cvm-body">
        <main className="cvm-main">
          <HtmlSections data={data} placement="main" />
        </main>
        <aside className="cvm-aside">
          <HtmlSections data={data} placement="sidebar" />
        </aside>
      </div>
    </div>
  );
}
