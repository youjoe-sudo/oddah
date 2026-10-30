import { getContentStorage } from './storage';

/**
 * بحث في نص المصحف.
 *
 * مهم: البحث **لا يعدّل النص المخزّن**. نبني نسخة مطبَّعة للبحث فقط
 * (إزالة التشكيل وعلامات الضبط وتوحيد الهمزات)، ونحتفظ بخريطة تعيد كل
 * موقع إلى النص الأصلي حتى يُعرض المقطع كما ورد حرفيًا.
 */

const TATWEEL = '\u0640';

/** حروف تُوحَّد للبحث فقط: همزات الألف، الألف المقصورة، التاء المربوطة… */
function foldChar(char: string): string {
  switch (char) {
    case 'أ':
    case 'إ':
    case 'آ':
    case 'ٱ':
      return 'ا';
    case 'ى':
      return 'ي';
    case 'ئ':
      return 'ي';
    case 'ؤ':
      return 'و';
    case 'ة':
      return 'ه';
    case 'ۀ':
      return 'ه';
    default:
      return char;
  }
}

export type NormalizedText = { text: string; indexMap: number[] };

/** يطبّع نصًا عربيًا للبحث، ويعيد خريطة إلى مواضع الحروف الأصلية. */
export function normalizeArabic(input: string): NormalizedText {
  const indexMap: number[] = [];
  let text = '';
  let lastWasSpace = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    // \p{M}: كل علامات التشكيل والضبط (حركات، شدّة، سكون، ألف خنجرية…)
    if (/\p{M}/u.test(char) || char === TATWEEL) continue;

    let folded = foldChar(char);
    if (/\s/.test(folded)) {
      if (lastWasSpace) continue;
      folded = ' ';
      lastWasSpace = true;
    } else {
      lastWasSpace = false;
    }

    text += folded;
    indexMap.push(index);
  }

  return { text, indexMap };
}

type IndexedAyah = {
  surah: number;
  ayah: number;
  original: string;
  normalized: NormalizedText;
};

let indexCache: IndexedAyah[] | null = null;

/** فهرس في الذاكرة — البيانات محلية وثابتة، فيُبنى مرة واحدة لكل عملية. */
async function getIndex(): Promise<IndexedAyah[]> {
  if (indexCache) return indexCache;

  const storage = getContentStorage();
  const { surahs } = await storage.getQuranIndex();
  const ayahs: IndexedAyah[] = [];

  for (const surah of surahs) {
    const doc = await storage.getSurahText(surah.number);
    if (!doc) continue;
    doc.ayahs.forEach((text, index) => {
      ayahs.push({
        surah: surah.number,
        ayah: index + 1,
        original: text,
        normalized: normalizeArabic(text),
      });
    });
  }

  indexCache = ayahs;
  return indexCache;
}

/** للاختبارات فقط. */
export function resetQuranSearchCache(): void {
  indexCache = null;
}

export type QuranSearchMatch = {
  surah: number;
  ayah: number;
  /** أجزاء المقطع من النص الأصلي (قبل/المطابق/بعد) لعرض التمييز دون تعديل النص. */
  before: string;
  match: string;
  after: string;
};

export type QuranSearchResult = {
  query: string;
  total: number;
  matches: QuranSearchMatch[];
  truncated: boolean;
};

const MIN_QUERY_LENGTH = 2;
const SNIPPET_CONTEXT = 40;

export async function searchQuran(rawQuery: string, limit = 50): Promise<QuranSearchResult> {
  const query = normalizeArabic(rawQuery.trim()).text.trim();

  if (query.length < MIN_QUERY_LENGTH) {
    return { query, total: 0, matches: [], truncated: false };
  }

  const ayahs = await getIndex();
  const matches: QuranSearchMatch[] = [];
  let total = 0;

  for (const ayah of ayahs) {
    const position = ayah.normalized.text.indexOf(query);
    if (position === -1) continue;

    total += 1;
    if (matches.length >= limit) continue;

    const startOriginal = ayah.normalized.indexMap[position];
    const matchedLength = query.length;
    const endOriginal =
      ayah.normalized.indexMap[Math.min(position + matchedLength - 1, ayah.normalized.indexMap.length - 1)] +
      1;

    matches.push({
      surah: ayah.surah,
      ayah: ayah.ayah,
      before: ayah.original.slice(Math.max(0, startOriginal - SNIPPET_CONTEXT), startOriginal),
      match: ayah.original.slice(startOriginal, endOriginal),
      after: ayah.original.slice(endOriginal, endOriginal + SNIPPET_CONTEXT),
    });
  }

  return { query, total, matches, truncated: total > matches.length };
}
