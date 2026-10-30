import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { getEnv } from '../env';
import {
  adhkarDatasetSchema,
  libraryDatasetSchema,
  sourcesDatasetSchema,
  surahDatasetSchema,
  quranTextMetaSchema,
  surahTextSchema,
  bookmarkSchema,
  type Adhkar,
  type Bookmark,
  type DatasetMeta,
  type LibraryItem,
  type QuranTextMeta,
  type Source,
  type Surah,
  type SurahText,
} from './schemas';

/**
 * مزوّد التخزين المحلي بملفات JSON — التخزين المؤقت المعتمد حتى أمر التبديل.
 * يقرأ من `JSON_DATA_DIR` (افتراضيًا src/data) ويكتب حالة المستخدم في
 * `JSON_RUNTIME_DIR` (افتراضيًا data/runtime).
 */

const dataDir = () => getEnv().JSON_DATA_DIR;
const runtimeDir = () => getEnv().JSON_RUNTIME_DIR;

function readJson<T>(relativePath: string): T {
  // turbopackIgnore: المسار قابل للتهيئة (JSON_DATA_DIR) ولا نريد أن يُضمّن
  // المُجمِّع المشروع كله؛ الملفات تُقرأ وقت البناء/التشغيل من جذر المشروع.
  const path = resolve(/* turbopackIgnore: true */ process.cwd(), dataDir(), relativePath);
  if (!existsSync(path)) {
    throw new Error(`Missing local dataset: ${path}`);
  }
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

/** يتحقّق من المخطط ومن قواعد المحتوى عبر الملفات (المصدر والنشر). */
function loadSources(): Source[] {
  const doc = sourcesDatasetSchema.parse(readJson('sources.json'));
  return doc.sources;
}

function loadQuranIndex(): { _meta: DatasetMeta; surahs: Surah[] } {
  return surahDatasetSchema.parse(readJson('quran-surahs.json'));
}

function crossCheck<T extends { id: string; sourceId: string; status: string }>(
  items: T[],
  sources: Source[],
  dataset: string,
): void {
  const byId = new Map(sources.map((s) => [s.id, s]));
  for (const item of items) {
    const source = byId.get(item.sourceId);
    if (!source) {
      throw new Error(`${dataset}: item "${item.id}" references unknown source "${item.sourceId}"`);
    }
    if (item.status === 'published' && source.verificationStatus !== 'verified') {
      throw new Error(
        `${dataset}: item "${item.id}" is published but source "${source.id}" is ${source.verificationStatus}`,
      );
    }
  }
}

function loadAdhkar(): Adhkar[] {
  const sources = loadSources();
  const doc = adhkarDatasetSchema.parse(readJson('adhkar.json'));
  crossCheck(doc.items, sources, 'adhkar.json');
  return doc.items;
}

function loadLibrary(): LibraryItem[] {
  const sources = loadSources();
  const doc = libraryDatasetSchema.parse(readJson('library-items.json'));
  crossCheck(doc.items, sources, 'library-items.json');
  return doc.items;
}

const bookmarksPath = () => resolve(process.cwd(), runtimeDir(), 'bookmarks.json');

function readBookmarks(): Bookmark[] {
  const path = bookmarksPath();
  if (!existsSync(path)) return [];
  const raw = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  if (!Array.isArray(raw)) throw new Error(`Corrupt bookmarks file: ${path}`);
  return raw.map((row, i) => {
    const parsed = bookmarkSchema.safeParse(row);
    if (!parsed.success) {
      throw new Error(`Corrupt bookmark at index ${i} in ${path}: ${parsed.error.message}`);
    }
    return parsed.data;
  });
}

function writeBookmarks(rows: Bookmark[]): void {
  const path = bookmarksPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(rows, null, 2) + '\n', 'utf8');
}

export const jsonContentStorage = {
  async listSources(): Promise<Source[]> {
    return loadSources();
  },
  async getSource(id: string): Promise<Source | null> {
    return loadSources().find((s) => s.id === id) ?? null;
  },
  /** الفهرس مع بيانات المصدر (تُعرض الإسناد في الواجهة — شرط الرخصة). */
  async getQuranIndex(): Promise<{ _meta: DatasetMeta; surahs: Surah[] }> {
    return loadQuranIndex();
  },
  async listSurahs(): Promise<Surah[]> {
    return loadQuranIndex().surahs;
  },
  async getSurah(number: number): Promise<Surah | null> {
    return loadQuranIndex().surahs.find((s) => s.number === number) ?? null;
  },
  /** بيانات مصدر النص: الرخصة والإسناد وحالة المراجعة (تُعرض مع كل نص). */
  async getQuranTextMeta(): Promise<QuranTextMeta> {
    return quranTextMetaSchema.parse(readJson('quran-text/_meta.json'));
  },
  async getSurahText(
    number: number,
  ): Promise<{ meta: QuranTextMeta; surah: Surah; ayahs: string[] } | null> {
    const surah = loadQuranIndex().surahs.find((s) => s.number === number);
    if (!surah) return null;

    const meta = quranTextMetaSchema.parse(readJson('quran-text/_meta.json'));
    const file = `quran-text/${String(number).padStart(3, '0')}.json`;
    const doc: SurahText = surahTextSchema.parse(readJson(file));

    if (doc.surah !== number) {
      throw new Error(`quran-text: ${file} يحتوي السورة ${doc.surah} بدل ${number}`);
    }
    if (doc.ayahs.length !== surah.ayahCount) {
      throw new Error(
        `quran-text: السورة ${number} فيها ${doc.ayahs.length} آية، والفهرس يتوقع ${surah.ayahCount}`,
      );
    }
    return { meta, surah, ayahs: doc.ayahs };
  },
  async listAdhkar(): Promise<Adhkar[]> {
    return loadAdhkar();
  },
  async listLibraryItems(): Promise<LibraryItem[]> {
    return loadLibrary();
  },
  async getLibraryItem(id: string): Promise<LibraryItem | null> {
    return loadLibrary().find((i) => i.id === id) ?? null;
  },
};

export const jsonUserStorage = {
  async listBookmarks(userId: string): Promise<Bookmark[]> {
    return readBookmarks().filter((b) => b.userId === userId);
  },
  async addBookmark(
    bookmark: Omit<Bookmark, 'createdAt'> & { createdAt?: string },
  ): Promise<Bookmark> {
    const row: Bookmark = {
      ...bookmark,
      createdAt: bookmark.createdAt ?? new Date().toISOString(),
    };
    const parsed = bookmarkSchema.parse(row);
    const rows = readBookmarks();
    const exists = rows.some(
      (b) => b.userId === parsed.userId && b.contentId === parsed.contentId && b.anchor === parsed.anchor,
    );
    if (!exists) {
      writeBookmarks([...rows, parsed]);
    }
    return parsed;
  },
  async removeBookmark(userId: string, contentId: string, anchor: string): Promise<boolean> {
    const rows = readBookmarks();
    const next = rows.filter(
      (b) => !(b.userId === userId && b.contentId === contentId && b.anchor === anchor),
    );
    if (next.length === rows.length) return false;
    writeBookmarks(next);
    return true;
  },
};
