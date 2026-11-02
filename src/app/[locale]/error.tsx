'use client';

import { useParams } from 'next/navigation';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import ar from '@/i18n/dictionaries/ar.json';
import en from '@/i18n/dictionaries/en.json';
import { Container } from '@/components/ui/Container';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';

/** حد خطأ محلي: رسالة مفهومة وإجراء استرداد واحد. */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams<{ locale?: string }>();
  const pathLocale = params?.locale;
  const locale: Locale = isLocale(pathLocale) ? pathLocale : defaultLocale;
  const dict = locale === 'ar' ? ar : en;

  return (
    <Container className="py-16">
      <ErrorState
        title={dict.error.title}
        body={dict.error.body}
        action={<Button onClick={reset}>{dict.error.retry}</Button>}
      />
      {error.digest ? (
        <p className="mt-3 text-xs text-subtle">
          {dict.footer.status} · {error.digest}
        </p>
      ) : null}
    </Container>
  );
}
