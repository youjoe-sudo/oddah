import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { dirFor, locales } from '@/i18n/config';
import { resolvePage } from '@/i18n/page';import { SiteHeader } from '@/components/ui/SiteHeader';
import { Container } from '@/components/ui/Container';
import '../globals.css';

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dict } = await resolvePage(params);
  return {
    title: { default: dict.meta.title, template: `%s · ${dict.meta.title}` },
    description: dict.meta.description,
    alternates: {
      languages: { ar: '/ar', en: '/en' },
    },
  };
}

export default async function RootLayout({ children, params }: Props) {
  const { locale, dict } = await resolvePage(params);

  return (
    <html lang={locale} dir={dirFor(locale)}>
      <body className="flex min-h-screen flex-col">
        <SiteHeader locale={locale} dict={dict} />
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t border-slate-200 bg-white">
          <Container className="flex flex-col gap-2 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>{dict.footer.status}</span>
            <span>{dict.footer.docs}</span>
          </Container>
        </footer>
      </body>
    </html>
  );
}

/** يمنع توليد صفحات بلغات غير مدعومة أثناء البناء. */
export function generateViewport() {
  return { width: 'device-width', initialScale: 1 };
}
