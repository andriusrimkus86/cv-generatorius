import { nanoid } from 'nanoid';
import { db } from '../db/db';
import { cloneWithNewIds } from '../model/defaults';
import { EXPORT_APP_ID, EXPORT_SCHEMA_VERSION, exportFileSchema, type ExportFile } from '../model/schema';
import type { CvDocument, Profile } from '../model/types';

function download(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'profilis';

/** Eksportuoja nurodytus profilius (arba visus, jei ids nenurodyti) į JSON failą. */
export async function exportProfiles(ids?: string[]) {
  const profiles = ids ? ((await db.profiles.bulkGet(ids)).filter(Boolean) as Profile[]) : await db.profiles.toArray();
  const file: ExportFile = {
    app: EXPORT_APP_ID,
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    profiles: await Promise.all(
      profiles.map(async (profile) => ({
        profile,
        documents: await db.documents.where('profileId').equals(profile.id).toArray(),
      })),
    ),
  };
  const date = new Date().toISOString().slice(0, 10);
  const name = profiles.length === 1 && ids ? slug(profiles[0].name) : 'visi-profiliai';
  download(`cv-${name}-${date}.json`, JSON.stringify(file, null, 2));
}

/**
 * Importuoja JSON failą. Esami duomenys niekada neperrašomi: jei toks profilis jau yra,
 * sukuriama kopija su naujais ID. Grąžina importuotų profilių skaičių.
 */
export async function importProfiles(text: string): Promise<number> {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('Failas nėra tinkamas JSON.');
  }
  const parsed = exportFileSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(parsed.error);
    throw new Error('Failas neatpažintas kaip CV generatoriaus eksportas arba yra sugadintas.');
  }

  await db.transaction('rw', db.profiles, db.documents, async () => {
    for (const { profile, documents } of parsed.data.profiles) {
      const conflict =
        !!(await db.profiles.get(profile.id)) ||
        (await db.documents.bulkGet(documents.map((d) => d.id))).some(Boolean);
      if (!conflict) {
        await db.profiles.add(profile);
        await db.documents.bulkPut(documents as CvDocument[]);
        continue;
      }
      const profileId = nanoid();
      const idMap = new Map<string, string>();
      const docs = (documents as CvDocument[]).map((d) => {
        const newId = nanoid();
        idMap.set(d.id, newId);
        return { ...d, id: newId, profileId, data: cloneWithNewIds(d.data) };
      });
      await db.profiles.add({
        ...profile,
        id: profileId,
        name: `${profile.name} (importuotas)`,
        activeDocId: idMap.get(profile.activeDocId) ?? docs[0].id,
      });
      await db.documents.bulkAdd(docs);
    }
  });
  return parsed.data.profiles.length;
}
