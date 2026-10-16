import { mixColor } from '../templates/common';
import { TEMPLATES } from '../templates/registry';
import { THEMES } from '../templates/themes';
import type { Theme } from '../templates/types';

/** Šablono ir spalvų temos pasirinkimas su miniatiūromis. */
export function DesignPicker({
  templateId,
  themeId,
  onChange,
}: {
  templateId: string;
  themeId: string;
  onChange: (fields: { templateId?: string; themeId?: string }) => void;
}) {
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  return (
    <div className="design-picker">
      <div className="field">
        <span className="field-label">Dizainas</span>
        <div className="design-options" role="radiogroup" aria-label="Dizainas">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={t.id === templateId}
              className="design-option"
              title={t.name}
              onClick={() => onChange({ templateId: t.id })}
            >
              <Thumb id={t.id} theme={theme} />
              <span>{t.name.split(':')[0]}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <span className="field-label">Spalvos: {theme.name}</span>
        <div className="swatches" role="radiogroup" aria-label="Spalvų tema">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={t.id === themeId}
              aria-label={t.name}
              title={t.name}
              className="swatch"
              style={{ background: `linear-gradient(135deg, ${t.sidebarBg} 55%, ${t.accent} 55%)` }}
              onClick={() => onChange({ themeId: t.id })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Schematinė A4 miniatiūra (be teksto), parodanti maketo struktūrą. */
function Thumb({ id, theme: t }: { id: string; theme: Theme }) {
  const line = (x: number, y: number, w: number, c = '#d5d9df', h = 2) => (
    <rect x={x} y={y} width={w} height={h} rx={1} fill={c} />
  );
  const lines = (x: number, y: number, w: number, n: number, c?: string) =>
    Array.from({ length: n }, (_, i) => <g key={i}>{line(x, y + i * 6, w - (i % 2) * 8, c)}</g>);
  return (
    <svg viewBox="0 0 70 99" className="design-thumb" aria-hidden="true">
      <rect width="70" height="99" fill="#fff" />
      {id === 'classic' && (
        <>
          <rect width="23" height="99" fill={t.sidebarBg} />
          <circle cx="11.5" cy="12" r="6" fill={mixColor(t.sidebarBg, '#ffffff', 0.5)} />
          {lines(4, 24, 15, 4, mixColor(t.sidebarBg, '#ffffff', 0.4))}
          <rect x="28" y="8" width="20" height="5" fill={t.text} />
          {line(28, 26, 36, t.accent)}
          {lines(28, 32, 36, 5)}
          {line(28, 64, 36, t.accent)}
          {lines(28, 70, 36, 4)}
        </>
      )}
      {id === 'modern' && (
        <>
          <rect x="47" width="23" height="99" fill={mixColor(t.sidebarBg, '#ffffff', 0.92)} />
          <rect width="70" height="22" fill={t.sidebarBg} />
          <circle cx="11" cy="11" r="6" fill={t.accent} />
          <rect x="21" y="8" width="26" height="4" fill="#fff" />
          {line(21, 15, 30, mixColor(t.sidebarBg, '#ffffff', 0.5))}
          {line(5, 28, 8, t.accent)}
          {lines(5, 34, 38, 5)}
          {line(5, 66, 8, t.accent)}
          {lines(5, 72, 38, 4)}
          {line(50, 28, 6, t.accent)}
          {lines(50, 34, 16, 6)}
        </>
      )}
      {id === 'minimal' && (
        <>
          <rect x="5" y="7" width="28" height="5" fill={t.text} />
          {line(5, 15, 40, '#c4c8ce')}
          <rect x="5" y="21" width="60" height="1" fill={t.accent} />
          <rect x="23" y="26" width="0.6" height="68" fill="#d5d9df" />
          {line(5, 27, 10, t.accent)}
          {lines(5, 33, 15, 5)}
          {line(27, 27, 14, t.accent)}
          {lines(27, 33, 38, 5)}
          {lines(27, 65, 38, 4)}
        </>
      )}
    </svg>
  );
}
