import Link from 'next/link';
import { Search } from 'lucide-react';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { Container } from './Container';
import { Brand } from './Brand';
import { LocaleSwitcher } from './LocaleSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { MobileNav } from './MobileNav';
import { buttonStyles } from './Button';

/** الشريط العلوي: العلامة على الجوال، وأدوات اللغة والمظهر والبحث. */
export function TopBar({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-background">
      <Container className="flex h-16 items-center gap-2">
        <Link
          href={`/${locale}`}
          className="inline-flex shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus md:hidden"
          aria-label={dict.meta.title}
        >
          <Brand locale={locale} />
        </Link>

        <p className="hidden max-w-md truncate text-sm text-muted md:block">
          {dict.brand.tagline}
        </p>

        <div className="ms-auto flex items-center gap-0.5">
          <div className="hidden sm:block">
            <Link
              href={`/${locale}/quran/search`}
              aria-label={dict.quran.searchTitle}
              className={buttonStyles({ variant: 'ghost', size: 'sm' })}
            >
              <Search aria-hidden="true" className="size-4" strokeWidth={1.75} />
              <span className="hidden lg:inline">{dict.quran.searchTitle}</span>
            </Link>
          </div>

          <LocaleSwitcher current={locale} label={dict.nav.language} />
          <ThemeToggle label={dict.nav.theme} />
          <MobileNav
            locale={locale}
            labels={dict.nav}
            mainLabel={dict.nav.main}
            openLabel={dict.nav.openMenu}
            closeLabel={dict.nav.closeMenu}
          />
        </div>
      </Container>
    </header>
  );
}
