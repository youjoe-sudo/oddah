import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Clock,
  GraduationCap,
  Library,
  ShieldCheck,
} from 'lucide-react';
import { resolvePage } from '@/i18n/page';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LinkButton } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale, dict } = await resolvePage(params);

  const quickLinks = [
    {
      href: `/${locale}/quran`,
      icon: BookOpen,
      title: dict.home.quick.quran,
      description: dict.quran.intro,
    },
    {
      href: `/${locale}/prayer`,
      icon: Clock,
      title: dict.home.quick.prayer,
      description: dict.prayer.intro,
    },
    {
      href: `/${locale}/library`,
      icon: Library,
      title: dict.home.quick.library,
      description: dict.library.intro,
    },
    {
      href: `/${locale}/learn`,
      icon: GraduationCap,
      title: dict.home.quick.learn,
      description: dict.learn.intro,
    },
  ];

  return (
    <Container className="py-8 md:py-12">
      <section className="overflow-hidden rounded-xl border border-line bg-surface px-6 py-10 shadow-card sm:px-10 md:py-14">
        <div className="flex items-center gap-10">
          <div className="min-w-0 max-w-2xl flex-1">
            <p
              className={
                locale === 'ar'
                  ? 'text-xs font-semibold text-gold-strong'
                  : 'text-xs font-semibold tracking-[0.16em] text-gold-strong uppercase'
              }
            >
              {dict.brand.promise}
            </p>
            <h1 className="mt-4 text-heading-lg font-bold text-foreground sm:text-display">
              {dict.home.hero.title}
            </h1>
            <p className="mt-4 text-lg text-muted">{dict.home.hero.subtitle}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <LinkButton href={`/${locale}/quran`} size="lg">
                <BookOpen aria-hidden="true" className="size-5" strokeWidth={1.75} />
                {dict.home.cta.quran}
              </LinkButton>
              <LinkButton href={`/${locale}/prayer`} variant="secondary" size="lg">
                <Clock aria-hidden="true" className="size-5" strokeWidth={1.75} />
                {dict.home.cta.prayer}
              </LinkButton>
              <LinkButton href={`/${locale}/library`} variant="ghost" size="lg">
                <Library aria-hidden="true" className="size-5" strokeWidth={1.75} />
                {dict.home.cta.library}
              </LinkButton>
            </div>

            <p className="mt-6 max-w-xl text-xs leading-relaxed text-subtle">
              {dict.quran.source}
            </p>
          </div>

          <div
            aria-hidden="true"
            className="hidden shrink-0 text-gold opacity-[0.16] xl:block xl:size-56 2xl:size-72"
          >
            <svg viewBox="0 0 200 200" fill="none" className="size-full">
              <path
                d="M100 18c45 0 82 37 82 82v82H18V100c0-45 37-82 82-82Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M100 42c32 0 58 26 58 58v58H42v-58c0-32 26-58 58-58Z"
                stroke="currentColor"
                strokeWidth="1"
              />
              <path
                d="M100 66c19 0 34 15 34 34v34H66v-34c0-19 15-34 34-34Z"
                stroke="currentColor"
                strokeWidth="1"
              />
              <circle cx="100" cy="100" r="3" fill="currentColor" />
            </svg>
          </div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="quick-access-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="quick-access-heading"
              className="text-heading-md font-semibold text-foreground"
            >
              {dict.home.quick.heading}
            </h2>
            <p className="mt-1 text-sm text-muted">{dict.home.quick.body}</p>
          </div>
          <Link
            href={`/${locale}/quran/search`}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-forest underline-offset-4 hover:underline"
          >
            {dict.quran.searchTitle}
            <ArrowRight aria-hidden="true" className="flip-rtl size-4" strokeWidth={1.75} />
          </Link>
        </div>

        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex h-full flex-col rounded-lg border border-line bg-surface p-5 shadow-card transition-colors hover:border-line-strong hover:bg-surface-muted"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex size-11 items-center justify-center rounded-md bg-forest-soft text-forest"
                  >
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="mt-4 font-semibold text-foreground">{item.title}</span>
                  <span className="mt-1 flex-1 text-sm text-muted">{item.description}</span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-forest">
                    {dict.home.quick.open}
                    <ArrowRight
                      aria-hidden="true"
                      className="flip-rtl size-3.5 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={1.75}
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="status-heading">
        <Card variant="muted" padding="lg" className="border-line-strong">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span
                aria-hidden="true"
                className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-surface text-forest shadow-soft"
              >
                <ShieldCheck className="size-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2
                    id="status-heading"
                    className="text-heading-sm font-semibold text-foreground"
                  >
                    {dict.home.status.heading}
                  </h2>
                  <StatusBadge tone="planned" label={dict.status.planned} />
                </div>
                <p className="mt-2 max-w-2xl text-sm text-muted">{dict.home.status.body}</p>
              </div>
            </div>
            <Link
              href={`/${locale}/studio`}
              className={cn(
                'inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start text-sm font-semibold text-forest underline-offset-4 hover:underline',
              )}
            >
              {dict.home.status.link}
              <ArrowRight aria-hidden="true" className="flip-rtl size-4" strokeWidth={1.75} />
            </Link>
          </div>
        </Card>
      </section>
    </Container>
  );
}
