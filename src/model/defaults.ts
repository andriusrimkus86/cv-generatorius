import { nanoid } from 'nanoid';
import type { Bullet, CvData, KeyValue, Placement, Section, SectionKind, Tag, TimelineItem } from './types';

export const KIND_LABELS: Record<SectionKind, string> = {
  text: 'Tekstas',
  tags: 'Žymos (pvz. įgūdžiai, kalbos)',
  list: 'Punktų sąrašas',
  keyValue: 'Pavadinimas: reikšmė',
  timeline: 'Laiko juosta (patirtis, mokslai)',
  personal: 'Asmeninė informacija',
  licence: 'Vairuotojo pažymėjimas',
};

export const PLACEMENT_LABELS: Record<Placement, string> = {
  sidebar: 'Šoninė juosta',
  main: 'Pagrindinė dalis',
};

export const newBullet = (text = ''): Bullet => ({ id: nanoid(), text });
export const newTag = (text = ''): Tag => ({ id: nanoid(), text });
export const newKeyValue = (label = '', value = ''): KeyValue => ({ id: nanoid(), label, value });

export const newTimelineItem = (): TimelineItem => ({
  id: nanoid(),
  org: '',
  title: '',
  bullets: [],
});

export function newSection(kind: SectionKind, title: string, placement: Placement): Section {
  const base = { id: nanoid(), title, placement };
  switch (kind) {
    case 'text':
      return { ...base, kind, text: '' };
    case 'tags':
      return { ...base, kind, items: [] };
    case 'list':
      return { ...base, kind, items: [] };
    case 'keyValue':
      return { ...base, kind, items: [] };
    case 'timeline':
      return { ...base, kind, items: [] };
    case 'personal':
    case 'licence':
      return { ...base, kind };
  }
}

/** Tuščias CV naujam profiliui: standartinės sekcijos be duomenų. */
export function createEmptyData(): CvData {
  return {
    personal: {
      firstName: '',
      lastName: '',
      address: '',
      phone: '',
      email: '',
      customFields: [],
    },
    sections: [
      newSection('text', 'Apie mane', 'sidebar'),
      newSection('tags', 'Įgūdžiai', 'sidebar'),
      newSection('personal', 'Asmeninė informacija', 'sidebar'),
      newSection('licence', 'Vairuotojo pažymėjimas', 'sidebar'),
      newSection('timeline', 'Darbo patirtis', 'main'),
      newSection('timeline', 'Išsilavinimas', 'main'),
    ],
  };
}

/** Giliai nukopijuoja CV duomenis ir suteikia naujus ID (dublikavimui). */
export function cloneWithNewIds(data: CvData): CvData {
  const copy: CvData = structuredClone(data);
  const reId = (arr: { id: string }[]) => arr.forEach((x) => (x.id = nanoid()));
  reId(copy.personal.customFields);
  for (const s of copy.sections) {
    s.id = nanoid();
    if (s.kind === 'timeline') {
      reId(s.items);
      s.items.forEach((i) => reId(i.bullets));
    } else if ('items' in s) {
      reId(s.items);
    }
  }
  return copy;
}
