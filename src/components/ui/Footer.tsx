import Link from 'next/link';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { Container } from './Container';
import { Brand } from './Brand';

/** تذييل موحد وهادئ. */
export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <Container className="flex flex-col gap-5 py-8 pb-24 sm:flex-row sm:items-center sm:justify-between md:pb-8">
        <div className="flex items-center gap-3">
          <Brand locale={locale} compact />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{dict.brand.tagline}</p>
            <p className="mt-0.5 text-xs text-subtle">{dict.footer.status}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
          <Link
            href={`/${locale}/quran`}
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            {dict.nav.quran}
          </Link>
          <Link
            href={`/${locale}/library`}
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            {dict.nav.library}
          </Link>
          <Link
            href={`/${locale}/studio`}
            className="text-subtle underline-offset-4 hover:text-foreground hover:underline"
          >
            {dict.footer.docs}
          </Link>
        </div>
      </Container>
    </footer>
  );
}
