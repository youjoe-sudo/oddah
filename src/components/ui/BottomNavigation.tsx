'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { bottomNav, hrefFor, isNavActive, type NavKey } from './nav-items';

/** شريط تنقل سفلي مبسّط للجوال. */
export function BottomNavigation({
  locale,
  labels,
  mainLabel,
}: {
  locale: string;
  labels: Record<NavKey, string>;
  mainLabel: string;
}) {
  const pathname = usePathname() ?? `/${locale}`;

  return (
    <nav
      aria-label={mainLabel}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 gap-0.5 px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        {bottomNav.map(({ key, path, icon: Icon }) => {
          const active = isNavActive(pathname, locale, path);
          return (
            <li key={key}>
              <Link
                href={hrefFor(locale, path)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-medium transition-colors',
                  active
                    ? 'bg-primary-soft text-primary'
                    : 'text-muted hover:bg-surface-muted hover:text-foreground',
                )}
              >
                <Icon
                  aria-hidden="true"
                  strokeWidth={active ? 2 : 1.75}
                  className="size-5"
                />
                <span className="max-w-full truncate">{labels[key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
