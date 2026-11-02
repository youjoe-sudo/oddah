import Link from 'next/link';
import { Search, SearchX } from 'lucide-react';
import { resolvePage } from '@/i18n/page';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { getContentStorage } from '@/lib/storage';
import { searchQuran } from '@/lib/quran-search';

export const instant = false;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function QuranSearchPage({ params, searchParams }: Props) {
  const { locale, dict } = await resolvePage(params);
  const { q } = await searchParams;
  const query = typeof q === 'string' ? q : '';
  const result = await searchQuran(query);
  const { surahs } = await getContentStorage().getQuranIndex();
  const surahByNumber = new Map(surahs.map((surah) => [surah.number, surah]));

  const fill = (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce(
      (text, [key, value]) => text.replace(`{${key}}`, String(value)),
      template,
    );

  return (
    <>
      <PageHeader
        title={dict.quran.searchTitle}
        intro={dict.quran.searchHint}
        actions={
          <Link
            href={`/${locale}/quran`}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-forest underline-offset-4 hover:underline"
          >
            {dict.quran.backToIndex}
          </Link>
        }
      />

      <Container className="py-8 md:py-10">
        <form
          action={`/${locale}/quran/search`}
          method="get"
          role="search"
          className="flex flex-col gap-2 sm:flex-row"
        >
          <label htmlFor="quran-search" className="sr-only">
            {dict.quran.searchTitle}
          </label>
          <Input
            id="quran-search"
            type="search"
            name="q"
            defaultValue={query}
            placeholder={dict.quran.search}
            className="flex-1"
          />
          <Button type="submit" className="sm:w-auto">
            <Search aria-hidden="true" className="size-4" strokeWidth={1.75} />
            {dict.quran.searchGo}
          </Button>
        </form>

        {query.trim().length < 2 ? (
          <Card variant="muted" className="mt-6 border-dashed">
            <p className="flex items-start gap-2 text-sm text-muted">
              <Search aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
              {dict.quran.searchHint}
            </p>
          </Card>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted">
              {fill(dict.quran.searchResults, { count: result.total })}
            </p>

            {result.truncated ? (
              <p className="rounded-md border border-warning/25 bg-warning-surface px-4 py-3 text-sm text-warning">
                {fill(dict.quran.searchTruncated, { limit: result.matches.length })}
              </p>
            ) : null}

            {result.total === 0 ? (
              <EmptyState
                icon={SearchX}
                title={dict.quran.searchEmpty}
                body={dict.quran.searchHint}
                action={
                  <Link
                    href={`/${locale}/quran`}
                    className="inline-flex min-h-11 items-center text-sm font-semibold text-forest underline-offset-4 hover:underline"
                  >
                    {dict.quran.backToIndex}
                  </Link>
                }
              />
            ) : (
              <ol className="space-y-3">
                {result.matches.map((match) => {
                  const surah = surahByNumber.get(match.surah);
                  const surahName = surah
                    ? locale === 'ar'
                      ? surah.nameAr
                      : surah.nameEn
                    : String(match.surah);

                  return (
                    <li
                      key={`${match.surah}:${match.ayah}`}
                      className="rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link
                          href={`/${locale}/quran/${match.surah}#ayah-${match.ayah}`}
                          className="inline-flex min-h-9 items-center text-sm font-semibold text-forest underline-offset-4 hover:underline"
                        >
                          {surahName} · {match.ayah}
                        </Link>
                        <span className="rounded-pill bg-surface-muted px-2.5 py-1 text-xs text-muted">
                          {fill(dict.quran.searchAyah, { ayah: match.ayah })}
                        </span>
                      </div>

                      <p dir="rtl" lang="ar" className="quran-text mt-3 text-foreground">
                        {match.before}
                        <mark className="rounded-sm bg-gold/40 px-0.5 text-foreground">
                          {match.match}
                        </mark>
                        {match.after}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        )}
      </Container>
    </>
  );
}
