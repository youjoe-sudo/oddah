import { describe, expect, it } from 'vitest';
import { defaultLocale, dirFor, isLocale, locales, switchLocaleInPath } from './config';
import ar from './dictionaries/ar.json';
import en from './dictionaries/en.json';

/** يجمع كل المفاتيح المتداخلة في ملف قاموس. */
function keysOf(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === 'object' && !Array.isArray(value)
      ? keysOf(value as Record<string, unknown>, path)
      : [path];
  });
}

/** يجمع كل القيم النصية للتأكد من عدم وجود نص فارغ. */
function valuesOf(obj: Record<string, unknown>): unknown[] {
  return Object.values(obj).flatMap((value) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? valuesOf(value as Record<string, unknown>)
      : [value],
  );
}

describe('dictionaries', () => {
  it('العربية والإنجليزية تتطابقان في المفاتيح بالكامل', () => {
    const arKeys = keysOf(ar as Record<string, unknown>).sort();
    const enKeys = keysOf(en as unknown as Record<string, unknown>).sort();
    expect(enKeys).toEqual(arKeys);
  });

  it('لا توجد قيمة نصية فارغة في أي نسخة', () => {
    for (const dict of [ar, en]) {
      const empties = valuesOf(dict as unknown as Record<string, unknown>).filter(
        (v) => typeof v !== 'string' || v.trim() === '',
      );
      expect(empties).toEqual([]);
    }
  });

  it('النصوص العربية والإنجليزية ليست متطابقة حرفًا بحرف (منع النسخ العرضي)', () => {
    expect(JSON.stringify(ar)).not.toBe(JSON.stringify(en));
  });
});

describe('locale config', () => {
  it('يدعم العربية والإنجليزية فقط', () => {
    expect([...locales]).toEqual(['ar', 'en']);
    expect(defaultLocale).toBe('ar');
  });

  it('يحدّد الاتجاه الصحيح لكل لغة', () => {
    expect(dirFor('ar')).toBe('rtl');
    expect(dirFor('en')).toBe('ltr');
  });

  it('يتحقق من صحة اللغة', () => {
    expect(isLocale('ar')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(null)).toBe(false);
  });

  it('يبدّل اللغة في المسار مع الحفاظ على بقية المسار', () => {
    expect(switchLocaleInPath('/ar/quran', 'en')).toBe('/en/quran');
    expect(switchLocaleInPath('/en/library/deep/item', 'ar')).toBe('/ar/library/deep/item');
    expect(switchLocaleInPath('/quran', 'ar')).toBe('/ar/quran');
  });
});
