import Link from 'next/link';
import { resolvePage } from '@/i18n/page';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale, dict } = await resolvePage(params);

  const ctas = [
    { href: `/${locale}/quran`, label: dict.home.cta.quran },
    { href: `/${locale}/prayer`, label: dict.home.cta.prayer },
    { href: `/${locale}/library`, label: dict.home.cta.library },
  ];

  return (
    <Container className="py-10">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          {dict.home.hero.title}
        </h1>
        <p className="mt-4 text-lg text-slate-600">{dict.home.hero.subtitle}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {ctas.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {dict.home.status.heading}
            </h2>
            <StatusBadge tone="planned" label={dict.status.planned} />
          </div>
          <p className="mt-3 text-slate-600">{dict.home.status.body}</p>
          <Link
            href={`/${locale}/studio`}
            className="mt-4 inline-block text-sm font-medium text-sky-700 underline-offset-4 hover:underline"
          >
            {dict.home.status.link}
          </Link>
        </Card>
      </section>
    </Container>
  );
}
