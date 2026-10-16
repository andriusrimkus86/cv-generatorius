import { nanoid } from 'nanoid';
import seedPhotoUrl from '../assets/placeholder-avatar.svg';
import { cloneWithNewIds, createEmptyData } from '../model/defaults';
import { createSeedData } from '../model/seed';
import type { CvData, CvDocument, Profile } from '../model/types';
import { DEFAULT_TEMPLATE_ID } from '../templates/registry';
import { DEFAULT_THEME_ID } from '../templates/themes';
import { db } from './db';

export async function createProfile(name: string, data: CvData = createEmptyData()): Promise<Profile> {
  const now = Date.now();
  const profileId = nanoid();
  const doc: CvDocument = {
    id: nanoid(),
    profileId,
    name: 'Pagrindinė',
    templateId: DEFAULT_TEMPLATE_ID,
    themeId: DEFAULT_THEME_ID,
    data,
    updatedAt: now,
  };
  const profile: Profile = { id: profileId, name, activeDocId: doc.id, createdAt: now, updatedAt: now };
  await db.transaction('rw', db.profiles, db.documents, async () => {
    await db.profiles.add(profile);
    await db.documents.add(doc);
  });
  return profile;
}

export async function renameProfile(id: string, name: string) {
  await db.profiles.update(id, { name, updatedAt: Date.now() });
}

export async function deleteProfile(id: string) {
  await db.transaction('rw', db.profiles, db.documents, async () => {
    await db.documents.where('profileId').equals(id).delete();
    await db.profiles.delete(id);
  });
}

export async function duplicateProfile(id: string): Promise<Profile | undefined> {
  const src = await db.profiles.get(id);
  if (!src) return;
  const docs = await db.documents.where('profileId').equals(id).toArray();
  const now = Date.now();
  const profileId = nanoid();
  const idMap = new Map<string, string>();
  const newDocs = docs.map((d) => {
    const newId = nanoid();
    idMap.set(d.id, newId);
    return { ...d, id: newId, profileId, data: cloneWithNewIds(d.data), updatedAt: now };
  });
  const profile: Profile = {
    id: profileId,
    name: `${src.name} (kopija)`,
    activeDocId: idMap.get(src.activeDocId) ?? newDocs[0]?.id ?? '',
    createdAt: now,
    updatedAt: now,
  };
  await db.transaction('rw', db.profiles, db.documents, async () => {
    await db.profiles.add(profile);
    await db.documents.bulkAdd(newDocs);
  });
  return profile;
}

/** Nauja CV versija kaip esamos kopija. */
export async function duplicateDocument(docId: string, name: string): Promise<CvDocument | undefined> {
  const src = await db.documents.get(docId);
  if (!src) return;
  const doc: CvDocument = { ...src, id: nanoid(), name, data: cloneWithNewIds(src.data), updatedAt: Date.now() };
  await db.documents.add(doc);
  await setActiveDocument(src.profileId, doc.id);
  return doc;
}

export async function renameDocument(docId: string, name: string) {
  await db.documents.update(docId, { name, updatedAt: Date.now() });
}

/** Ištrina versiją, jei ji ne paskutinė. Grąžina versiją, kuri tampa aktyvi. */
export async function deleteDocument(docId: string): Promise<string | undefined> {
  const doc = await db.documents.get(docId);
  if (!doc) return;
  const siblings = await db.documents.where('profileId').equals(doc.profileId).toArray();
  const next = siblings.find((d) => d.id !== docId);
  if (!next) return;
  await db.documents.delete(docId);
  await setActiveDocument(doc.profileId, next.id);
  return next.id;
}

export async function setActiveDocument(profileId: string, docId: string) {
  await db.profiles.update(profileId, { activeDocId: docId });
}

export async function saveDocument(doc: CvDocument) {
  const now = Date.now();
  await db.transaction('rw', db.profiles, db.documents, async () => {
    await db.documents.put({ ...doc, updatedAt: now });
    await db.profiles.update(doc.profileId, { updatedAt: now });
  });
}

async function urlToDataUrl(url: string): Promise<string> {
  const blob = await (await fetch(url)).blob();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

let seeding: Promise<void> | undefined;

/** Pirmą kartą paleidus sukuria profilį su pavyzdinio CV duomenimis. */
export function ensureSeeded() {
  seeding ??= seed();
  return seeding;
}

async function seed() {
  // Prašome naršyklės nevalyti duomenų, kai trūksta vietos.
  navigator.storage?.persist?.().catch(() => {});
  const seeded = await db.meta.get('seeded');
  if (seeded) return;
  await db.meta.put({ key: 'seeded', value: true });
  if ((await db.profiles.count()) > 0) return;
  const data = createSeedData();
  try {
    data.personal.photo = await urlToDataUrl(seedPhotoUrl);
  } catch {
    data.personal.photo = undefined;
  }
  await createProfile('Pavyzdys', data);
}
