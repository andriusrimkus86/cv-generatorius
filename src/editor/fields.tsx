import { useLayoutEffect, useRef, type InputHTMLAttributes } from 'react';
import { MONTHS_LONG } from '../model/dates';
import type { YearMonth } from '../model/types';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export function TextField({ label, value, onChange, className, ...rest }: TextFieldProps) {
  return (
    <label className={`field ${className ?? ''}`}>
      <span className="field-label">{label}</span>
      <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

const nativeAutoSize = typeof CSS !== 'undefined' && CSS.supports('field-sizing', 'content');

/** Teksto laukas, kuris auga kartu su turiniu (CSS field-sizing, senesnėse naršyklėse – JS). */
export function AutoTextarea({
  value,
  onChange,
  placeholder,
  ariaLabel,
  minRows = 2,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  minRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || nativeAutoSize) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={minRows}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function TextAreaField({ label, ...rest }: { label: string; value: string; onChange: (v: string) => void; minRows?: number }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <AutoTextarea {...rest} />
    </label>
  );
}

/** Mėnesio ir metų pasirinkimas. Mėnuo neprivalomas. */
export function MonthYearPicker({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value?: YearMonth;
  onChange: (v: YearMonth | undefined) => void;
  disabled?: boolean;
}) {
  const setYear = (raw: string) => {
    const year = parseInt(raw, 10);
    if (!raw) onChange(undefined);
    else if (!Number.isNaN(year)) onChange({ year, month: value?.month });
  };
  const setMonth = (raw: string) => {
    const month = raw ? Number(raw) : undefined;
    onChange({ year: value?.year ?? new Date().getFullYear(), month });
  };
  return (
    <fieldset className="field month-year" disabled={disabled}>
      <legend className="field-label">{label}</legend>
      <div className="month-year-row">
        <select aria-label={`${label}: mėnuo`} value={value?.month ?? ''} onChange={(e) => setMonth(e.target.value)}>
          <option value="">— mėnuo —</option>
          {MONTHS_LONG.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <input
          aria-label={`${label}: metai`}
          type="number"
          inputMode="numeric"
          min={1900}
          max={2100}
          placeholder="metai"
          value={value?.year ?? ''}
          onChange={(e) => setYear(e.target.value)}
        />
      </div>
    </fieldset>
  );
}
