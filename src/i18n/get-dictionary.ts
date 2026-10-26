import type { Locale } from './config';
import ar from './dictionaries/ar.json';

/**
 * الشكل المرجعي للقاموس هو النسخة العربية؛ أي نسخة أخرى يجب
 * أن تطابق هذا الشكل (تُفحص الآلية في `src/i18n/dictionaries.test.ts`).
 */
export type Dictionary = typeof ar;

const load: Record<Locale, () => Promise<Dictionary>> = {
  ar: async () => ar,
  en: async () => (await import('./dictionaries/en.json')).default as Dictionary,
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return load[locale]();
}
