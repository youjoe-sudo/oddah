export const locales = ['ar', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ar';

/** اتجاه الكتابة لكل لغة: العربية RTL، الإنجليزية LTR. */
export function dirFor(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/** يبدّل لغة المسار الحفاظًا على بقية المسار: /ar/quran -> /en/quran */
export function switchLocaleInPath(pathname: string, next: Locale): string {
  const segments = pathname.split('/');
  if (isLocale(segments[1])) {
    segments[1] = next;
    return segments.join('/') || `/${next}`;
  }
  return `/${next}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}
