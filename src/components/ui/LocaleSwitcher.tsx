'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, switchLocaleInPath, type Locale } from '@/i18n/config';
import { cn } from '@/lib/cn';

/** مبدّل اللغة: يغيّر جزء اللغة في المسار الحالي ويحافظ على بقية المسار. */
export function LocaleSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname() || `/${current}`;

  return (
    <nav
      aria-label={label}
      className="inline-flex items-center rounded-pill border border-line bg-surface p-0.5"
    >
      <span className="sr-only">{label}</span>
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={switchLocaleInPath(pathname, locale)}
            hrefLang={locale}
            aria-current={active ? 'true' : undefined}
            className={cn(
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill px-2.5 text-xs font-semibold transition-colors',
              active
                ? 'bg-primary text-on-primary'
                : 'text-muted hover:bg-surface-muted hover:text-foreground',
            )}
          >
            {locale === 'ar' ? 'عربي' : 'EN'}
          </Link>
        );
      })}
    </nav>
  );
}
