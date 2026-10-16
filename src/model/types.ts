export type ID = string;

/** Mėnuo neprivalomas: be jo rodomi tik metai (pvz. išsilavinime „2019"). */
export interface YearMonth {
  year: number;
  month?: number; // 1–12
}

export interface Profile {
  id: ID;
  name: string;
  activeDocId: ID;
  createdAt: number;
  updatedAt: number;
}

/** Viena CV versija. Profilis gali turėti kelias (pvz. pritaikytas skirtingoms pozicijoms). */
export interface CvDocument {
  id: ID;
  profileId: ID;
  name: string;
  templateId: string;
  themeId: string;
  data: CvData;
  updatedAt: number;
}

export interface CvData {
  personal: PersonalInfo;
  /** Tvarka masyve yra tvarka CV. */
  sections: Section[];
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  /** Apkirpta nuotrauka kaip dataURL, kad JSON eksportas būtų savarankiškas. */
  photo?: string;
  /** ISO data 'YYYY-MM-DD'. */
  birthDate?: string;
  maritalStatus?: string;
  drivingLicence?: string;
  customFields: KeyValue[];
}

export interface KeyValue {
  id: ID;
  label: string;
  value: string;
  hidden?: boolean;
}

export interface Bullet {
  id: ID;
  text: string;
  hidden?: boolean;
}

export interface Tag {
  id: ID;
  text: string;
  hidden?: boolean;
}

export interface TimelineItem {
  id: ID;
  hidden?: boolean;
  /** Įmonė arba įstaiga (rodoma kairėje). */
  org: string;
  /** Pareigos arba laipsnis (rodoma dešinėje). */
  title: string;
  start?: YearMonth;
  end?: YearMonth | 'present';
  bullets: Bullet[];
}

export type Placement = 'sidebar' | 'main';

interface SectionBase {
  id: ID;
  title: string;
  placement: Placement;
  hidden?: boolean;
}

export type TextSection = SectionBase & { kind: 'text'; text: string };
export type TagsSection = SectionBase & { kind: 'tags'; items: Tag[] };
export type KeyValueSection = SectionBase & { kind: 'keyValue'; items: KeyValue[] };
export type ListSection = SectionBase & { kind: 'list'; items: Bullet[] };
export type TimelineSection = SectionBase & { kind: 'timeline'; items: TimelineItem[] };
/** Rodo gimimo datą, šeimyninę padėtį ir pasirinktinius asmeninės info laukus. */
export type PersonalSection = SectionBase & { kind: 'personal' };
/** Rodo vairuotojo pažymėjimą. */
export type LicenceSection = SectionBase & { kind: 'licence' };

export type Section =
  | TextSection
  | TagsSection
  | KeyValueSection
  | ListSection
  | TimelineSection
  | PersonalSection
  | LicenceSection;

export type SectionKind = Section['kind'];
