import Link from 'next/link';
import { BookOpen, ChevronRight, Search } from 'lucide-react';
import { resolvePage } from '@/i18n/page';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LinkButton } from '@/components/ui/Button';
import { getContentStorage } from '@/lib/storage';

type Props = { params: Promise<{ locale: string }> };

export default async function QuranPage({ params }: Props) {
  const { locale, dict } = await resolvePage(params);
  const { _meta: meta, surahs } = await getContentStorage().getQuranIndex();

  return (
    <>
      <PageHeader
        title={dict.quran.title}
        intro={dict.quran.intro}
        badge={<StatusBadge tone="verifying" label={dict.library.demoData} />}
        actions={
          <LinkButton href={`/${locale}/quran/search`} variant="secondary">
            <Search aria-hidden="true" className="size-4" strokeWidth={1.75} />
            {dict.quran.searchTitle}
          </LinkButton>
        }
      />

      <Container className="py-8 md:py-10">
        <Card variant="muted" className="mb-6 border-line-strong">
          <div className="flex items-start gap-3.5">
            <span
              aria-hidden="true"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-surface text-forest shadow-soft"
            >
              <BookOpen className="size-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <h2 className="text-heading-sm font-semibold text-foreground">
                {dict.quran.index}
              </h2>
              <p className="mt-1.5 text-sm text-muted">{dict.quran.metadataNotice}</p>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-subtle">
                <span>{dict.library.source}:</span>
                {meta.sourceUrl ? (
                  <a
                    href={meta.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-medium text-forest underline-offset-4 hover:underline"
                  >
                    {meta.sourceName ?? meta.sourceUrl}
                  </a>
                ) : (
                  <span>{meta.sourceName ?? '—'}</span>
                )}
                {meta.fetchedAt ? <span>· {meta.fetchedAt}</span> : null}
                <span>
                  · {surahs.length} {dict.quran.surahUnit}
                </span>
              </p>
            </div>
          </div>
        </Card>

        <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
          <div className="hidden grid-cols-[3rem_1fr_6rem_6rem_1.5rem] items-center gap-3 border-b border-line bg-surface-muted px-4 py-3 text-xs font-semibold text-muted sm:grid">
            <span>{dict.quran.number}</span>
            <span>{dict.quran.surah}</span>
            <span>{dict.quran.ayahs}</span>
            <span>{dict.quran.revelation}</span>
            <span className="sr-only">{dict.home.quick.open}</span>
          </div>

          <ul className="divide-y divide-line">
            {surahs.map((surah) => {
              const revelation =
                surah.revelation === 'meccan' ? dict.quran.meccan : dict.quran.medinan;
              return (
                <li key={surah.number}>
                  <Link
                    href={`/${locale}/quran/${surah.number}`}
                    className="group grid min-h-14 grid-cols-[2.5rem_1fr_1.25rem] items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted sm:grid-cols-[3rem_1fr_6rem_6rem_1.5rem]"
                  >
                    <span className="inline-flex size-9 items-center justify-center rounded-pill border border-line bg-surface-muted text-xs font-semibold text-muted tabular-nums">
                      {surah.number}
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-foreground group-hover:text-forest">
                        {locale === 'ar' ? surah.nameAr : surah.nameEn}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted sm:hidden">
                        <span>
                          {surah.ayahCount} {dict.quran.ayahUnit}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{revelation}</span>
                      </span>
                      {locale === 'en' ? (
                        <span className="mt-0.5 hidden text-xs font-normal text-subtle sm:block">
                          {surah.translationEn}
                        </span>
                      ) : null}
                    </span>

                    <span className="hidden text-sm text-muted tabular-nums sm:block">
                      {surah.ayahCount}
                    </span>
                    <span className="hidden sm:block">
                      <span className="inline-flex rounded-pill bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted">
                        {revelation}
                      </span>
                    </span>

                    <ChevronRight
                      aria-hidden="true"
                      className="flip-rtl size-4 text-subtle transition-transform group-hover:translate-x-0.5"
                      strokeWidth={1.75}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </>
  );
}
