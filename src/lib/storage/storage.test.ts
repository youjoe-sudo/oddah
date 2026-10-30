import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { resetEnvCache } from '../env';
import { getContentStorage, getUserStorage } from './index';

let runtimeDir: string;

beforeAll(() => {
  runtimeDir = mkdtempSync(join(tmpdir(), 'ip-runtime-'));
  process.env.JSON_RUNTIME_DIR = runtimeDir;
  resetEnvCache();
});

afterAll(() => {
  delete process.env.JSON_RUNTIME_DIR;
  resetEnvCache();
  rmSync(runtimeDir, { recursive: true, force: true });
});

describe('بيانات المحتوى المحلية (JSON)', () => {
  it('سجل المصادر: معرّفات فريدة، ورخصة لكل مصدر', async () => {
    const sources = await getContentStorage().listSources();
    expect(sources.length).toBeGreaterThanOrEqual(3);

    const ids = sources.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const source of sources) {
      expect(source.license.trim()).not.toBe('');
      if (source.verificationStatus === 'verified') {
        expect(source.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('فهرس السور: 114 سورة بترتيب صحيح وأسماء بالعربية والإنجليزية', async () => {
    const surahs = await getContentStorage().listSurahs();
    expect(surahs).toHaveLength(114);
    surahs.forEach((surah, index) => {
      expect(surah.number).toBe(index + 1);
      expect(surah.nameAr.trim()).not.toBe('');
      expect(surah.nameEn.trim()).not.toBe('');
      expect(surah.ayahCount).toBeGreaterThanOrEqual(3);
    });
  });

  it('البيانات الوصفية لا تحتوي نصًّا قرآنيًا (النص يحتاج مصدرًا مرخّصًا)', async () => {
    const surahs = await getContentStorage().listSurahs();
    for (const surah of surahs) {
      const keys = Object.keys(surah);
      expect(keys).not.toContain('text');
      expect(keys).not.toContain('textAr');
      expect(keys).not.toContain('ayahs');
    }
  });

  it('كل قطعة محتوى تشير إلى مصدر موجود (P-4)', async () => {
    const storage = getContentStorage();
    const sources = await storage.listSources();
    const sourceIds = new Set(sources.map((s) => s.id));

    for (const item of await storage.listLibraryItems()) {
      expect(sourceIds.has(item.sourceId)).toBe(true);
    }
    for (const item of await storage.listAdhkar()) {
      expect(sourceIds.has(item.sourceId)).toBe(true);
    }
  });

  it('لا محتوى منشورًا من مصدر غير موثّق', async () => {
    const storage = getContentStorage();
    const byId = new Map((await storage.listSources()).map((s) => [s.id, s]));

    for (const item of await storage.listLibraryItems()) {
      if (item.status === 'published') {
        expect(byId.get(item.sourceId)?.verificationStatus).toBe('verified');
      }
    }
    for (const item of await storage.listAdhkar()) {
      expect(item.status).not.toBe('published');
    }
  });

  it('الأذكار التجريبية تحمل إسنادًا وتنتظر مراجعة اللجنة الشرعية', async () => {
    const adhkar = await getContentStorage().listAdhkar();
    expect(adhkar.length).toBeGreaterThan(0);
    for (const item of adhkar) {
      expect(item.citationAr.trim()).not.toBe('');
      expect(item.textAr).toMatch(/[\u0600-\u06FF]/);
      expect(item.status).toBe('in_review');
    }
  });

  it('يرفض المزوّد نشر قطعة من مصدر غير موثّق', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ip-bad-data-'));
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'sources.json'),
      JSON.stringify({
        _meta: { dataset: 'content-sources' },
        sources: [
          {
            id: 'bad-source',
            nameAr: 'مصدر غير موثّق',
            nameEn: 'Unverified source',
            url: null,
            license: 'Unknown',
            licenseUrl: null,
            attribution: null,
            allowsProcessing: false,
            allowsCommercial: false,
            verificationStatus: 'unverified',
            verifiedAt: null,
            notesAr: 'اختبار',
          },
        ],
      }),
      'utf8',
    );
    writeFileSync(
      join(dir, 'library-items.json'),
      JSON.stringify({
        _meta: { dataset: 'library-items' },
        items: [
          {
            id: 'bad-item',
            type: 'article',
            titleAr: 'عنصر',
            titleEn: 'Item',
            descriptionAr: 'وصف',
            descriptionEn: 'Description',
            sourceId: 'bad-source',
            status: 'published',
          },
        ],
      }),
      'utf8',
    );

    const previous = process.env.JSON_DATA_DIR;
    process.env.JSON_DATA_DIR = dir;
    resetEnvCache();
    try {
      await expect(getContentStorage().listLibraryItems()).rejects.toThrow(
        /bad-item.*published.*bad-source/,
      );
    } finally {
      if (previous === undefined) delete process.env.JSON_DATA_DIR;
      else process.env.JSON_DATA_DIR = previous;
      resetEnvCache();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('حالة المستخدم المحلية (JSON)', () => {
  it('إضافة علامة قراءة ثم منع التكرار ثم الحذف', async () => {
    const storage = getUserStorage();
    const base = { userId: 'user-demo', contentId: 'quran', anchor: '2:255', note: 'آية الكرسي' };

    await storage.addBookmark(base);
    await storage.addBookmark(base);
    expect(await storage.listBookmarks('user-demo')).toHaveLength(1);

    expect(await storage.listBookmarks('another-user')).toHaveLength(0);

    expect(await storage.removeBookmark('user-demo', 'quran', '2:255')).toBe(true);
    expect(await storage.listBookmarks('user-demo')).toHaveLength(0);
    expect(await storage.removeBookmark('user-demo', 'quran', '2:255')).toBe(false);
  });
});

describe('اختيار المزوّد', () => {
  it('الافتراضي هو JSON المحلي', async () => {
    delete process.env.DATA_PROVIDER;
    resetEnvCache();
    await expect(getContentStorage().listSources()).resolves.toBeInstanceOf(Array);
  });

  it('مسار Postgres غير المفعّل يُعطي خطأً واضحًا بدل فشل صامت', () => {
    process.env.DATA_PROVIDER = 'postgres';
    resetEnvCache();
    try {
      expect(() => getContentStorage()).toThrow(/postgres/);
    } finally {
      delete process.env.DATA_PROVIDER;
      resetEnvCache();
    }
  });
});
