'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import ar from '@/i18n/dictionaries/ar.json';
import en from '@/i18n/dictionaries/en.json';

/** محتوى 404 ثنائي اللغة — يعمل من الحد الجذري ومن حد لغة محددة. */
export function LocalizedNotFound() {
  const params = useParams<{ locale?: string }>();
  const pathLocale = params?.locale;
  const locale: Locale = isLocale(pathLocale) ? pathLocale : defaultLocale;
  const dict = locale === 'ar' ? ar : en;

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900">{dict.notFound.title}</h1>
      <p className="mt-3 text-slate-600">{dict.notFound.body}</p>
      <Link
        href={`/${locale}`}
        className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
      >
        {dict.notFound.back}
      </Link>
    </div>
  );
}
