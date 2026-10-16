import { formatDate } from '../model/dates';
import type { CvData, KeyValue } from '../model/types';

/** Bendra šablonų logika: ekrano (HTML) ir PDF versijos turi rodyti tą patį turinį. */

export const visible = <T extends { hidden?: boolean }>(items: T[]) => items.filter((i) => !i.hidden);

/** Sekcijos „Asmeninė informacija“ laukai. */
export function personalFields(data: CvData): KeyValue[] {
  const p = data.personal;
  const fields: KeyValue[] = [];
  if (p.birthDate) fields.push({ id: 'birth', label: 'Gimimo data', value: formatDate(p.birthDate) });
  if (p.maritalStatus) fields.push({ id: 'marital', label: 'Šeimyninė padėtis', value: p.maritalStatus });
  fields.push(...visible(p.customFields));
  return nonEmpty(fields);
}

/** Sekcijos „Vairuotojo pažymėjimas“ laukai. */
export function licenceFields(data: CvData): KeyValue[] {
  const value = data.personal.drivingLicence?.trim();
  return value ? [{ id: 'licence', label: 'Vairuotojo pažymėjimas', value }] : [];
}

export const nonEmpty = (items: KeyValue[]) => items.filter((i) => i.label.trim() || i.value.trim());

export function contactItems(data: CvData) {
  const p = data.personal;
  return (
    [
      { kind: 'address', value: p.address },
      { kind: 'phone', value: p.phone },
      { kind: 'email', value: p.email },
    ] as const
  ).filter((c) => c.value.trim());
}

/** Siūlomas PDF failo vardas, pvz. „Vardenis_Pavardenis_CV“. */
export function cvFileName(data: CvData) {
  const { firstName, lastName } = data.personal;
  return [firstName, lastName, 'CV'].filter(Boolean).join('_').replace(/\s+/g, '_');
}

/** Sumaišo dvi #RRGGBB spalvas: t=0 grąžina `a`, t=1 grąžina `b`. Naudojama šviesiems atspalviams. */
export function mixColor(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}
