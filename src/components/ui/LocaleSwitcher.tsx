'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, switchLocaleInPath, type Locale } from '@/i18n/config';

/** مبدّل اللغة: يغيّر جزء اللغة في المسار الحالي ويحافظ على بقية المسار. */
export function LocaleSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname() || `/${current}`;

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
      <span className="px-2 text-xs text-slate-500">{label}</span>
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={switchLocaleInPath(pathname, locale)}
            hrefLang={locale}
            aria-current={active ? 'true' : undefined}
            className={`rounded-md px-2.5 py-1 text-sm font-medium transition ${
              active
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {locale === 'ar' ? 'عربي' : 'EN'}
          </Link>
        );
      })}
    </div>
  );
}
