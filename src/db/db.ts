import Dexie, { type Table } from 'dexie';
import type { CvDocument, Profile } from '../model/types';

export interface MetaRow {
  key: string;
  value: unknown;
}

class CvDatabase extends Dexie {
  profiles!: Table<Profile, string>;
  documents!: Table<CvDocument, string>;
  meta!: Table<MetaRow, string>;

  constructor() {
    super('cv-generatorius');
    this.version(1).stores({
      profiles: 'id, updatedAt',
      documents: 'id, profileId',
      meta: 'key',
    });
  }
}

export const db = new CvDatabase();
