'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { hrefFor, isNavActive, primaryNav, type NavKey } from './nav-items';

/** قائمة الجوال الكاملة: تُفتح من الشريط العلوي وتغلق بالتنقل أو Escape. */
export function MobileNav({
  locale,
  labels,
  mainLabel,
  openLabel,
  closeLabel,
}: {
  locale: string;
  labels: Record<NavKey, string>;
  mainLabel: string;
  openLabel: string;
  closeLabel: string;
}) {
  const [openFor, setOpenFor] = useState<string | null>(null);
  const pathname = usePathname() ?? `/${locale}`;
  const panelRef = useRef<HTMLDivElement>(null);
  const open = openFor === pathname;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenFor(null);
    };

    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? closeLabel : openLabel}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpenFor(open ? null : pathname)}
        className="inline-flex size-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        {open ? (
          <X aria-hidden="true" className="size-5" strokeWidth={1.75} />
        ) : (
          <Menu aria-hidden="true" className="size-5" strokeWidth={1.75} />
        )}
      </button>

      {open ? (
        <div
          id="mobile-navigation"
          ref={panelRef}
          className="absolute inset-x-0 top-full border-b border-line bg-surface p-4 shadow-raised"
        >
          <nav aria-label={mainLabel}>
            <ul className="grid grid-cols-2 gap-1.5">
              {primaryNav.map(({ key, path, icon: Icon }) => {
                const active = isNavActive(pathname, locale, path);
                return (
                  <li key={key}>
                    <Link
                      href={hrefFor(locale, path)}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setOpenFor(null)}
                      className={cn(
                        'flex min-h-11 items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors',
                        active
                          ? 'bg-primary-soft text-primary'
                          : 'text-foreground hover:bg-surface-muted',
                      )}
                    >
                      <Icon
                        aria-hidden="true"
                        strokeWidth={1.75}
                        className="size-5 shrink-0"
                      />
                      <span className="truncate">{labels[key]}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
