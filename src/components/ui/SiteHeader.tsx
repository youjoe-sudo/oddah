import Link from 'next/link';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { Container } from './Container';
import { LocaleSwitcher } from './LocaleSwitcher';

const navKeys = ['home', 'quran', 'prayer', 'library', 'learn', 'studio', 'admin'] as const;

const navPaths: Record<(typeof navKeys)[number], string | null> = {
  home: null,
  quran: 'quran',
  prayer: 'prayer',
  library: 'library',
  learn: 'learn',
  studio: 'studio',
  admin: 'admin',
};

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
        <Link href={`/${locale}`} className="text-lg font-bold text-slate-900">
          {dict.meta.title}
        </Link>

        <nav className="order-3 w-full overflow-x-auto lg:order-2 lg:w-auto">
          <ul className="flex items-center gap-1 text-sm">
            {navKeys.map((key) => (
              <li key={key}>
                <Link
                  href={navPaths[key] === null ? `/${locale}` : `/${locale}/${navPaths[key]}`}
                  className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100"
                >
                  {dict.nav[key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="order-2 lg:order-3">
          <LocaleSwitcher current={locale} label={dict.nav.language} />
        </div>
      </Container>
    </header>
  );
}
