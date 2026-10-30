// جلب نص المصحف (الرسم العثماني) من Tanzil مع تحقّقات سلامة صارمة.
//
// الرخصة: CC BY 3.0 — نسخ حرفي فقط، بلا أي تعديل، مع ذكر tanzil.net.
// لهذا لا نُطبّع النص ولا نعيد تشكيله: نكتب ما وصلنا كما هو.
//
// الاستخدام: node scripts/fetch-quran-text.mjs
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOWNLOAD_URL =
  'https://tanzil.net/pub/download/index.php?quranType=uthmani&outType=txt-2&agree=true';
const OUT_DIR = join(root, 'src', 'data', 'quran-text');
const EXPECTED_AYAHS = 6236;

const sha256 = (data) => createHash('sha256').update(data).digest('hex');
const fail = (message) => {
  console.error(`✗ ${message}`);
  process.exit(1);
};

console.log('→ تنزيل نص Tanzil (uthmani)…');
const res = await fetch(DOWNLOAD_URL, {
  headers: {
    'user-agent': 'islamic-platform/0.1 (Quran text import; attribution: tanzil.net)',
    accept: 'text/plain',
  },
});
if (!res.ok) fail(`HTTP ${res.status}`);
const bytes = Buffer.from(await res.arrayBuffer());
if (bytes.length < 500_000) fail(`حجم غير متوقع (${bytes.length} بايت) — قد تكون صفحة خطأ`);

let raw;
try {
  raw = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
} catch {
  fail('الملف ليس UTF-8 صالحًا');
}
if (/<html/i.test(raw.slice(0, 300))) fail('المحتوى HTML وليس نصًّا');

const allLines = raw.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim() !== '');
// ملف Tanzil يذيّل إشعار حقوق بصيغة تعليقات (#). يُحفظ الإشعار ولا يُحسب آية.
const noticeLines = allLines.filter((line) => line.startsWith('#'));
const lines = allLines.filter((line) => !line.startsWith('#'));

const notice = noticeLines.join('\n').trim();
if (!notice.includes('tanzil.net')) {
  fail('إشعار الحقوق غير موجود في الملف — لا يمكن المتابعة دون حفظ الإسناد');
}

// التنسيق المتوقع: sura|aya|text
const parsed = lines.map((line, index) => {
  const match = line.match(/^(\d+)\|(\d+)\|(.+)$/);
  if (!match) fail(`سطر ${index + 1} لا يطابق التنسيق: ${line.slice(0, 40)}`);
  return { sura: Number(match[1]), aya: Number(match[2]), text: match[3] };
});

if (parsed.length !== EXPECTED_AYAHS) {
  fail(`عدد الآيات ${parsed.length} بدل ${EXPECTED_AYAHS}`);
}

const surahsMeta = JSON.parse(
  await readFile(join(root, 'src', 'data', 'quran-surahs.json'), 'utf8'),
).surahs;

const bySurah = new Map();
for (const ayah of parsed) {
  if (ayah.sura < 1 || ayah.sura > 114) fail(`رقم سورة خارج المدى: ${ayah.sura}`);
  if (!bySurah.has(ayah.sura)) bySurah.set(ayah.sura, []);
  bySurah.get(ayah.sura).push(ayah);
}

const problems = [];
for (let number = 1; number <= 114; number += 1) {
  const group = bySurah.get(number) ?? [];
  const expected = surahsMeta[number - 1]?.ayahCount;
  if (group.length !== expected) {
    problems.push(`سورة ${number}: ${group.length} آية بدل ${expected}`);
  }
  group.forEach((ayah, index) => {
    if (ayah.aya !== index + 1) problems.push(`سورة ${number}: ترتيب الآيات مكسور عند ${ayah.aya}`);
    if (!ayah.text.trim()) problems.push(`سورة ${number} آية ${ayah.aya}: نص فارغ`);
    if (!/[\u0600-\u06FF]/.test(ayah.text)) {
      problems.push(`سورة ${number} آية ${ayah.aya}: لا يحتوي حروفًا عربية`);
    }
  });
}
if (problems.length) fail(`تحقّقات فشلت:\n${problems.slice(0, 20).join('\n')}`);

// بصمة مرجعية للنص كما وصل (بعد إزالة BOM فقط) — لِتُقارن لاحقًا بالملفات المخزنة
const canonical = parsed.map((a) => `${a.sura}|${a.aya}|${a.text}`).join('\n') + '\n';
const canonicalSha256 = sha256(canonical);
const rawSha256 = sha256(bytes);

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

for (let number = 1; number <= 114; number += 1) {
  const ayahs = bySurah.get(number).map((a) => a.text);
  const file = join(OUT_DIR, `${String(number).padStart(3, '0')}.json`);
  await writeFile(file, JSON.stringify({ surah: number, ayahs }, null, 0) + '\n', 'utf8');
}

const meta = {
  dataset: 'quran-text',
  kind: 'quran-text-uthmani',
  sourceName: 'Tanzil Project',
  sourceUrl: 'https://tanzil.net/download/',
  downloadUrl: DOWNLOAD_URL,
  fetchedAt: new Date().toISOString().slice(0, 10),
  attribution: 'Quran text from Tanzil.net',
  license: 'CC BY 3.0',
  licenseUrl: 'https://tanzil.net/docs/text_license',
  copyPolicy: 'verbatim-only-no-modification',
  surahCount: 114,
  totalAyahs: parsed.length,
  rawSha256,
  canonicalSha256,
  // فئة A بحسب docs/05: لا نشر قبل قرار لجنة مكتمل
  reviewStatus: 'in_review',
  reviewedBy: null,
  reviewedAt: null,
  notesAr:
    'نص الرسم العثماني كما ورد من Tanzil دون تعديل. كل سورة في ملف مستقل. ' +
    'العرض تجريبي بانتظار اعتماد اللجنة الشرعية، ويجب إبقاء الإسناد ظاهرًا في كل عرض.',
  notice,
};

await writeFile(join(OUT_DIR, '_meta.json'), JSON.stringify(meta, null, 2) + '\n', 'utf8');

console.log(`✓ ${parsed.length} آية في ${bySurah.size} سورة`);
console.log(`✓ raw sha256: ${rawSha256}`);
console.log(`✓ canonical sha256: ${canonicalSha256}`);
console.log(`✓ الحفظ في ${OUT_DIR}`);
