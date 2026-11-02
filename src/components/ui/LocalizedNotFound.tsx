'use client';

import { useParams } from 'next/navigation';
import { Compass } from 'lucide-react';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import ar from '@/i18n/dictionaries/ar.json';
import en from '@/i18n/dictionaries/en.json';
import { LinkButton } from './Button';

/** محتوى 404 ثنائي اللغة — يعمل من الحد الجذري ومن حد لغة محددة. */
export function LocalizedNotFound() {
  const params = useParams<{ locale?: string }>();
  const pathLocale = params?.locale;
  const locale: Locale = isLocale(pathLocale) ? pathLocale : defaultLocale;
  const dict = locale === 'ar' ? ar : en;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <span
        aria-hidden="true"
        className="mb-5 inline-flex size-14 items-center justify-center rounded-pill bg-surface-muted text-gold-strong"
      >
        <Compass className="size-7" strokeWidth={1.75} />
      </span>
      <h1 className="text-heading-lg font-bold text-foreground">{dict.notFound.title}</h1>
      <p className="mt-3 text-muted">{dict.notFound.body}</p>
      <LinkButton href={`/${locale}`} className="mt-6">
        {dict.notFound.back}
      </LinkButton>
    </div>
  );
}
