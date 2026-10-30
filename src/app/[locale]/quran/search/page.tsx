import Link from 'next/link';
import { resolvePage } from '@/i18n/page';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
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
        badge={
          <Link href={`/${locale}/quran`} className="text-sm text-sky-700 underline">
            {dict.quran.backToIndex}
          </Link>
        }
      />
      <Container className="py-8">
        <form action={`/${locale}/quran/search`} method="get" className="flex flex-wrap gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder={dict.quran.search}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-5 py-2 font-medium text-white hover:bg-slate-800"
          >
            {dict.quran.searchGo}
          </button>
        </form>

        {query.trim().length >= 2 && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-slate-600">
              {fill(dict.quran.searchResults, { count: result.total })}
            </p>
            {result.truncated && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {fill(dict.quran.searchTruncated, { limit: result.matches.length })}
              </p>
            )}
            {result.total === 0 && (
              <p className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-slate-600">
                {dict.quran.searchEmpty}
              </p>
            )}

            <ol className="space-y-3">
              {result.matches.map((match) => {
                const surah = surahByNumber.get(match.surah);
                const surahName = surah ? (locale === 'ar' ? surah.nameAr : surah.nameEn) : String(match.surah);
                return (
                  <li
                    key={`${match.surah}:${match.ayah}`}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/${locale}/quran/${match.surah}#ayah-${match.ayah}`}
                        className="text-sm font-medium text-sky-700 underline"
                      >
                        {surahName} · {match.ayah}
                      </Link>
                      <span className="text-xs text-slate-500">
                        {fill(dict.quran.searchAyah, { ayah: match.ayah })}
                      </span>
                    </div>
                    <p dir="rtl" lang="ar" className="mt-2 text-right font-serif text-lg leading-loose text-slate-900">
                      {match.before}
                      <mark className="rounded bg-amber-200 px-0.5 text-slate-900">{match.match}</mark>
                      {match.after}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </Container>
    </>
  );
}
