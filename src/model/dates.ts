import type { TimelineItem, YearMonth } from './types';

export const MONTHS_SHORT = ['sau', 'vas', 'kov', 'bal', 'geg', 'bir', 'lie', 'rgp', 'rgs', 'spa', 'lap', 'gru'];
export const MONTHS_LONG = [
  'sausis', 'vasaris', 'kovas', 'balandis', 'gegužė', 'birželis',
  'liepa', 'rugpjūtis', 'rugsėjis', 'spalis', 'lapkritis', 'gruodis',
];

export const PRESENT_LABEL = 'Dabar';

/** {year: 2022, month: 11} → „lap 2022"; be mėnesio → „2022". */
export function formatYearMonth(ym: YearMonth): string {
  return ym.month ? `${MONTHS_SHORT[ym.month - 1]} ${ym.year}` : String(ym.year);
}

/** „lap 2022 - Dabar", „rgs 2019 - lap 2022" arba tik „2019". */
export function formatPeriod(item: Pick<TimelineItem, 'start' | 'end'>): string {
  const end = item.end === 'present' ? PRESENT_LABEL : item.end ? formatYearMonth(item.end) : '';
  const start = item.start ? formatYearMonth(item.start) : '';
  if (start && end) return `${start} - ${end}`;
  return start || end;
}

/** '1989-05-20' → „20 geg 1989". */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS_SHORT[Number(m[2]) - 1]} ${m[1]}`;
}
