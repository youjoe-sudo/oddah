// جلب البيانات الوصفية لفهرس السور من مصدر خارجي والتحقق منها قبل الحفظ.
// الاستخدام: node scripts/fetch-quran-meta.mjs
// الغرض: تجنّب كتابة بيانات قرآنية من الذاكرة — كل رقم يُجلب من مصدر مُعلن.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.alquran.cloud/v1/surah';
const out = join(root, 'src', 'data', 'quran-surahs.json');

const res = await fetch(API, { headers: { accept: 'application/json' } });
if (!res.ok) {
  console.error(`فشل الجلب: HTTP ${res.status}`);
  process.exit(1);
}
const payload = await res.json();
if (payload?.code !== 200 || !Array.isArray(payload.data)) {
  console.error('استجابة غير متوقعة من الواجهة');
  process.exit(1);
}

const revelation = (v) => (String(v).toLowerCase() === 'medinan' ? 'medinan' : 'meccan');

const surahs = payload.data.map((s) => ({
  number: s.number,
  nameAr: s.name,
  nameEn: s.englishName,
  translationEn: s.englishNameTranslation,
  ayahCount: s.numberOfAyahs,
  revelation: revelation(s.revelationType),
}));

// تحقّقات قبل الحفظ: التسلسل، المدى، وعدم وجود نص قرآني في هذه البيانات
const problems = [];
if (surahs.length !== 114) problems.push(`expected 114 surahs, got ${surahs.length}`);
surahs.forEach((s, i) => {
  if (s.number !== i + 1) problems.push(`surah at index ${i} has number ${s.number}`);
  if (!s.nameAr?.trim() || !s.nameEn?.trim()) problems.push(`surah ${s.number}: missing name`);
  if (!Number.isInteger(s.ayahCount) || s.ayahCount < 3 || s.ayahCount > 286) {
    problems.push(`surah ${s.number}: suspicious ayahCount ${s.ayahCount}`);
  }
});
if (problems.length) {
  console.error('تحقّقات فشلت:\n' + problems.join('\n'));
  process.exit(1);
}

const doc = {
  _meta: {
    dataset: 'quran-surahs',
    kind: 'metadata-only',
    sourceName: 'Al-Quran Cloud API',
    sourceUrl: API,
    fetchedAt: new Date().toISOString().slice(0, 10),
    verificationStatus: 'fetched-from-source',
    notesAr: 'بيانات وصفية فقط (أسماء وعدد آيات وأنواع نزول). لا تتضمن نصًا قرآنيًا؛ النص يُجلب من Tanzil عند ربط المصدر.',
  },
  surahs,
};

await mkdir(dirname(out), { recursive: true });
await writeFile(out, JSON.stringify(doc, null, 2) + '\n', 'utf8');
console.log(`تم حفظ ${surahs.length} سورة في ${out}`);
