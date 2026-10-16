import { z } from 'zod';

// JSON importo tikrinimas. Struktūra atitinka model/types.ts.

const id = z.string().min(1);
const hidden = z.boolean().optional();

const yearMonth = z.object({ year: z.number().int(), month: z.number().int().min(1).max(12).optional() });
const bullet = z.object({ id, text: z.string(), hidden });
const keyValue = z.object({ id, label: z.string(), value: z.string(), hidden });
const timelineItem = z.object({
  id,
  hidden,
  org: z.string(),
  title: z.string(),
  start: yearMonth.optional(),
  end: z.union([yearMonth, z.literal('present')]).optional(),
  bullets: z.array(bullet),
});

const base = { id, title: z.string(), placement: z.enum(['sidebar', 'main']), hidden };

const section = z.discriminatedUnion('kind', [
  z.object({ ...base, kind: z.literal('text'), text: z.string() }),
  z.object({ ...base, kind: z.literal('tags'), items: z.array(bullet) }),
  z.object({ ...base, kind: z.literal('keyValue'), items: z.array(keyValue) }),
  z.object({ ...base, kind: z.literal('list'), items: z.array(bullet) }),
  z.object({ ...base, kind: z.literal('timeline'), items: z.array(timelineItem) }),
  z.object({ ...base, kind: z.literal('personal') }),
  z.object({ ...base, kind: z.literal('licence') }),
]);

const cvData = z.object({
  personal: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address: z.string(),
    phone: z.string(),
    email: z.string(),
    photo: z.string().optional(),
    birthDate: z.string().optional(),
    maritalStatus: z.string().optional(),
    drivingLicence: z.string().optional(),
    customFields: z.array(keyValue),
  }),
  sections: z.array(section),
});

const cvDocument = z.object({
  id,
  profileId: id,
  name: z.string(),
  templateId: z.string(),
  themeId: z.string(),
  data: cvData,
  updatedAt: z.number(),
});

const profile = z.object({
  id,
  name: z.string(),
  activeDocId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const EXPORT_APP_ID = 'cv-generatorius';
export const EXPORT_SCHEMA_VERSION = 1;

export const exportFileSchema = z.object({
  app: z.literal(EXPORT_APP_ID),
  schemaVersion: z.number().int().max(EXPORT_SCHEMA_VERSION),
  exportedAt: z.string(),
  profiles: z.array(z.object({ profile, documents: z.array(cvDocument).min(1) })),
});

export type ExportFile = z.infer<typeof exportFileSchema>;
