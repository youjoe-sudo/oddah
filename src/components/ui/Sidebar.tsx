import Link from 'next/link';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { Brand } from './Brand';
import { SideNavigation } from './SideNavigation';

/** الشريط الجانبي على سطح المكتب — الهيكل الأساسي للتنقل. */
export function Sidebar({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e border-sidebar-line bg-sidebar md:flex lg:w-72">
      <div className="px-5 pt-6 pb-4">
        <Link
          href={`/${locale}`}
          className="inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          aria-label={dict.meta.title}
        >
          <Brand locale={locale} onDark />
        </Link>
        <p className="mt-4 text-xs leading-relaxed text-sidebar-muted">
          {dict.brand.tagline}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <SideNavigation
          locale={locale}
          labels={dict.nav}
          mainLabel={dict.nav.main}
        />
      </div>

      <div className="border-t border-sidebar-line p-4">
        <div className="rounded-md border border-sidebar-line bg-white/5 p-3">
          <p className="text-[11px] leading-relaxed text-sidebar-muted">
            {dict.footer.status}
          </p>
          <Link
            href={`/${locale}/studio`}
            className="mt-2 inline-flex text-xs font-semibold text-gold underline-offset-4 hover:underline"
          >
            {dict.home.status.link}
          </Link>
        </div>
      </div>
    </aside>
  );
}
