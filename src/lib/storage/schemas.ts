import { z } from 'zod';

/**
 * مخططات بيانات JSON المحلية (بيانات تجريبية مؤقتة).
 * كل قواعد التحقق مطبَّقة عند التحميل — أي ملف غير صالح يوقف التشغيل
 * برسالة واضحة بدل عرض بيانات ناقصة أو غير موثّقة.
 */

const MetaSchema = z.object({
  dataset: z.string().min(1),
  purpose: z.string().min(1).optional(),
  docs: z.string().min(1).optional(),
  kind: z.string().min(1).optional(),
  sourceName: z.string().min(1).optional(),
  sourceUrl: z.string().startsWith('http').optional(),
  fetchedAt: z.string().min(1).optional(),
  updatedAt: z.string().min(1).optional(),
  verificationStatus: z.string().min(1).optional(),
  status: z.string().min(1).optional(),
  notesAr: z.string().min(1).optional(),
});

export const verificationStatusSchema = z.enum(['verified', 'unverified', 'rejected']);

export const contentStatusSchema = z.enum([
  'draft',
  'planned',
  'in_review',
  'approved',
  'published',
  'rejected',
]);

export const sourceSchema = z.object({
  id: z.string().min(1),
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  url: z.string().startsWith('http').nullable(),
  license: z.string().min(1),
  licenseUrl: z.string().startsWith('http').nullable(),
  attribution: z.string().min(1).nullable(),
  allowsProcessing: z.boolean(),
  allowsCommercial: z.boolean(),
  verificationStatus: verificationStatusSchema,
  verifiedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  notesAr: z.string().min(1),
});

export const sourcesDatasetSchema = z.object({
  _meta: MetaSchema,
  sources: z.array(sourceSchema).min(1).superRefine((items, ctx) => {
    const seen = new Set<string>();
    items.forEach((s, i) => {
      if (seen.has(s.id)) {
        ctx.addIssue({ code: 'custom', message: `duplicate source id "${s.id}"`, path: [i, 'id'] });
      }
      seen.add(s.id);
      if (s.verificationStatus === 'verified' && !s.verifiedAt) {
        ctx.addIssue({
          code: 'custom',
          message: `source "${s.id}" is verified but has no verifiedAt`,
          path: [i, 'verifiedAt'],
        });
      }
    });
  }),
});

export const surahSchema = z.object({
  number: z.number().int().min(1).max(114),
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  translationEn: z.string().min(1),
  ayahCount: z.number().int().min(3).max(286),
  revelation: z.enum(['meccan', 'medinan']),
});

export const surahDatasetSchema = z
  .object({
    _meta: MetaSchema,
    surahs: z.array(surahSchema).length(114),
  })
  .superRefine((dataset, ctx) => {
    dataset.surahs.forEach((s, i) => {
      if (s.number !== i + 1) {
        ctx.addIssue({
          code: 'custom',
          message: `surah sequence broken at index ${i}: number ${s.number}`,
          path: ['surahs', i, 'number'],
        });
      }
    });
  });

export const quranTextMetaSchema = z
  .object({
    dataset: z.literal('quran-text'),
    kind: z.string().min(1),
    sourceName: z.string().min(1),
    sourceUrl: z.string().startsWith('http'),
    downloadUrl: z.string().startsWith('http'),
    fetchedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    attribution: z.string().min(1),
    license: z.string().min(1),
    licenseUrl: z.string().startsWith('http'),
    copyPolicy: z.literal('verbatim-only-no-modification'),
    surahCount: z.literal(114),
    totalAyahs: z.literal(6236),
    rawSha256: z.string().regex(/^[a-f0-9]{64}$/),
    canonicalSha256: z.string().regex(/^[a-f0-9]{64}$/),
    /** فئة A (docs/05): لا تُعتبر منشورة قبل قرار لجنة مكتمل */
    reviewStatus: z.enum(['in_review', 'approved', 'rejected']),
    reviewedBy: z.string().min(1).nullable(),
    reviewedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable(),
    notesAr: z.string().min(1),
    notice: z.string().min(1),
  })
  .superRefine((meta, ctx) => {
    if (meta.reviewStatus === 'approved' && (!meta.reviewedBy || !meta.reviewedAt)) {
      ctx.addIssue({
        code: 'custom',
        message: 'reviewStatus=approved يتطلب reviewedBy و reviewedAt (سجل مراجعة مكتمل)',
        path: ['reviewedBy'],
      });
    }
  });

export const surahTextSchema = z.object({
  surah: z.number().int().min(1).max(114),
  ayahs: z.array(z.string().min(1)).min(3).max(286),
});

export const adhkarSchema = z.object({
  id: z.string().min(1),
  category: z.enum(['morning', 'evening', 'sleep', 'prayer', 'general']),
  textAr: z.string().min(1),
  repeat: z.number().int().min(1).max(1000),
  citationAr: z.string().min(1),
  sourceId: z.string().min(1),
  status: contentStatusSchema,
  noteAr: z.string().min(1).optional(),
});

export const adhkarDatasetSchema = z.object({
  _meta: MetaSchema,
  items: z.array(adhkarSchema).min(1),
});

export const libraryItemSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['reference', 'hadith', 'tafsir', 'seira', 'lesson', 'article']),
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  descriptionAr: z.string().min(1),
  descriptionEn: z.string().min(1),
  sourceId: z.string().min(1),
  status: contentStatusSchema,
});

export const libraryDatasetSchema = z.object({
  _meta: MetaSchema,
  items: z.array(libraryItemSchema).min(1),
});

export const bookmarkSchema = z.object({
  userId: z.string().min(1),
  contentId: z.string().min(1),
  anchor: z.string().min(1),
  note: z.string().optional(),
  createdAt: z.string().min(1),
});

export type DatasetMeta = z.infer<typeof MetaSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Surah = z.infer<typeof surahSchema>;
export type QuranTextMeta = z.infer<typeof quranTextMetaSchema>;
export type SurahText = z.infer<typeof surahTextSchema>;
export type Adhkar = z.infer<typeof adhkarSchema>;
export type LibraryItem = z.infer<typeof libraryItemSchema>;
export type ContentStatus = z.infer<typeof contentStatusSchema>;
export type Bookmark = z.infer<typeof bookmarkSchema>;
