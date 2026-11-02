import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Amiri_Quran, Inter, Tajawal } from 'next/font/google';
import { dirFor, locales } from '@/i18n/config';
import { resolvePage } from '@/i18n/page';
import { Sidebar } from '@/components/ui/Sidebar';
import { TopBar } from '@/components/ui/TopBar';
import { Footer } from '@/components/ui/Footer';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { InlineScript } from '@/components/ui/InlineScript';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

/** خط المصحف العثماني — مخصص لنص الآيات فقط. */
const quranFace = Amiri_Quran({
  subsets: ['arabic'],
  weight: '400',
  variable: '--font-quran-face',
  display: 'swap',
});

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

const themeScript = `(function(){try{var t=localStorage.getItem('odda-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;

export default async function RootLayout({ children, params }: Props) {
  const { locale, dict } = await resolvePage(params);

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      className={`${inter.variable} ${tajawal.variable} ${quranFace.variable}`}
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="bg-background text-foreground">
        <a href="#main-content" className="skip-link">
          {dict.a11y.skipToContent}
        </a>

        <div className="mx-auto flex min-h-dvh w-full max-w-[1760px]">
          <Sidebar locale={locale} dict={dict} />

          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar locale={locale} dict={dict} />
            <main id="main-content" className="flex-1 pb-20 md:pb-0">
              {children}
            </main>
            <Footer locale={locale} dict={dict} />
          </div>
        </div>

        <BottomNavigation
          locale={locale}
          labels={dict.nav}
          mainLabel={dict.nav.main}
        />
      </body>
    </html>
  );
}

/** يمنع توليد صفحات بلغات غير مدعومة أثناء البناء. */
export function generateViewport() {
  return { width: 'device-width', initialScale: 1 };
}
