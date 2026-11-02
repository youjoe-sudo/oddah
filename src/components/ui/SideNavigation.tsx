'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { hrefFor, isNavActive, primaryNav, type NavKey } from './nav-items';

/** تنقل جانبي مع حالة الصفحة النشطة ودعم RTL/LTR. */
export function SideNavigation({
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
    <nav aria-label={mainLabel}>
      <ul className="space-y-1">
        {primaryNav.map(({ key, path, icon: Icon }) => {
          const active = isNavActive(pathname, locale, path);
          return (
            <li key={key}>
              <Link
                href={hrefFor(locale, path)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150',
                  active
                    ? 'bg-sidebar-active text-gold'
                    : 'text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground',
                )}
              >
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.75}
                  className={cn(
                    'size-5 shrink-0 transition-colors',
                    active ? 'text-gold' : 'text-sidebar-muted group-hover:text-sidebar-foreground',
                  )}
                />
                <span className="truncate">{labels[key]}</span>
                {active ? (
                  <span
                    aria-hidden="true"
                    className="ms-auto size-1.5 shrink-0 rounded-pill bg-gold"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
