import { describe, expect, it } from 'vitest';
import { normalizeArabic, resetQuranSearchCache, searchQuran } from './quran-search';

describe('normalizeArabic', () => {
  it('يزيل التشكيل ويوحّد الهمزات والألف المقصورة والتاء المربوطة', () => {
    expect(normalizeArabic('ٱلرَّحْمَٰنِ').text).toBe('الرحمن');
    expect(normalizeArabic('مُوسَىٰ').text).toBe('موسي');
    expect(normalizeArabic('رَحْمَةٌ').text).toBe('رحمه');
    expect(normalizeArabic('أَنْعَمْتَ').text).toBe('انعمت');
  });

  it('خريطة المواضع تعيد كل حرف مطبَّع إلى موضعه في النص الأصلي', () => {
    const original = 'ٱلرَّحْمَٰنِ';
    const normalized = normalizeArabic(original);
    expect(normalized.indexMap).toHaveLength(normalized.text.length);
    expect(normalized.text.length).toBeLessThan(original.length);
    normalized.indexMap.forEach((position) => {
      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThan(original.length);
    });
  });
});

describe('searchQuran', () => {
  it('يجد كلمة دون تشكيل رغم تشكيل النص', async () => {
    resetQuranSearchCache();
    const result = await searchQuran('الرحمن');

    expect(result.total).toBeGreaterThan(0);
    expect(result.matches.length).toBeGreaterThan(0);
    expect(normalizeArabic(result.matches[0].match).text).toContain('الرحمن');
  });

  it('يوحّد الهمزات في الاستعلام نفسه', async () => {
    resetQuranSearchCache();
    const plain = await searchQuran('انزل');
    const withHamza = await searchQuran('أنزل');

    expect(plain.total).toBeGreaterThan(0);
    expect(plain.total).toBe(withHamza.total);
  });

  it('الاستعلام الأقصر من حرفين لا يعيد شيئًا', async () => {
    expect((await searchQuran('ا')).total).toBe(0);
    expect((await searchQuran('  ')).total).toBe(0);
  });

  it('يحترم حد النتائج ويعلن الاقتطاع', async () => {
    resetQuranSearchCache();
    const result = await searchQuran('الله', 5);

    expect(result.matches).toHaveLength(5);
    expect(result.total).toBeGreaterThan(5);
    expect(result.truncated).toBe(true);
  });

  it('المقاطع المعروضة مأخوذة من النص الأصلي دون تعديل', async () => {
    resetQuranSearchCache();
    const { matches } = await searchQuran('موسى');
    const { getContentStorage } = await import('./storage');

    for (const match of matches.slice(0, 3)) {
      const doc = await getContentStorage().getSurahText(match.surah);
      const ayah = doc?.ayahs[match.ayah - 1] ?? '';
      expect(ayah).toContain(match.match);
    }
  });
});
