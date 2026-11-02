import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Bookmark, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { resolvePage } from '@/i18n/page';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LinkButton, buttonStyles } from '@/components/ui/Button';
import { getContentStorage, getUserStorage } from '@/lib/storage';
import { getUserId } from '@/lib/user-cookie';
import { cn } from '@/lib/cn';
import { toggleQuranBookmark } from './actions';

type Props = { params: Promise<{ locale: string; surah: string }> };

/** صفحة قراءة: تعتمد على بيانات السورة كاملة قبل العرض، فلا فائدة من هيكل فوري. */
export const instant = false;

/** 114 سورة × لغتان — تُبنى مسبقًا كصفحات ثابتة (البيانات محلية وقت البناء). */
export function generateStaticParams() {
  return Array.from({ length: 114 }, (_, index) => ({ surah: String(index + 1) }));
}

export default async function SurahPage({ params }: Props) {
  const { locale, dict } = await resolvePage(params);
  const { surah: rawSurah } = await params;

  const number = Number(rawSurah);
  if (!Number.isInteger(number) || number < 1 || number > 114) notFound();

  const result = await getContentStorage().getSurahText(number);
  if (!result) notFound();

  const { meta, surah, ayahs } = result;

  const userId = await getUserId();
  const savedAnchors = new Set(
    userId
      ? (await getUserStorage().listBookmarks(userId))
          .filter((bookmark) => bookmark.contentId === 'quran')
          .map((bookmark) => bookmark.anchor)
      : [],
  );

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(value);

  const title = `${formatNumber(surah.number)}. ${locale === 'ar' ? surah.nameAr : surah.nameEn}`;
  const intro = [
    `${dict.quran.ayahs}: ${formatNumber(surah.ayahCount)}`,
    surah.revelation === 'meccan' ? dict.quran.meccan : dict.quran.medinan,
  ].join(' · ');

  return (
    <>
      <PageHeader
        title={title}
        intro={intro}
        badge={<StatusBadge tone="verifying" label={dict.quran.textReview} />}
      />

      <Container className="py-8 md:py-10">
        <Card variant="highlight" className="mb-6">
          <div className="flex items-start gap-3">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-warning" strokeWidth={1.75} />
            <div className="min-w-0">
              <p className="text-sm text-warning">{dict.quran.textSourceNotice}</p>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-warning/90">
                <span>{dict.library.source}:</span>
                <a
                  href={meta.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-medium underline underline-offset-4"
                >
                  {meta.sourceName}
                </a>
                <span>· {meta.license}</span>
                <a
                  href={meta.licenseUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-4"
                >
                  {meta.licenseUrl}
                </a>
              </p>
            </div>
          </div>
        </Card>

        <ol className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
          {ayahs.map((text, index) => {
            const ayahNumber = index + 1;
            const saved = savedAnchors.has(`${surah.number}:${ayahNumber}`);
            return (
              <li
                key={index}
                id={`ayah-${ayahNumber}`}
                className="scroll-mt-24 border-b border-line px-4 py-5 last:border-b-0 sm:px-6"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-pill border border-line bg-surface-muted text-xs font-semibold text-muted tabular-nums">
                    {formatNumber(ayahNumber)}
                  </span>

                  <form action={toggleQuranBookmark}>
                    <input type="hidden" name="surah" value={surah.number} />
                    <input type="hidden" name="ayah" value={ayahNumber} />
                    <input type="hidden" name="locale" value={locale} />
                    <button
                      type="submit"
                      aria-pressed={saved}
                      aria-label={saved ? dict.quran.savedAyah : dict.quran.saveAyah}
                      className={buttonStyles({
                        variant: saved ? 'gold' : 'ghost',
                        size: 'sm',
                        className: 'min-h-11 min-w-11',
                      })}
                    >
                      <Bookmark
                        aria-hidden="true"
                        className={cn('size-4', saved && 'fill-current')}
                        strokeWidth={1.75}
                      />
                      <span className="hidden sm:inline">
                        {saved ? dict.quran.savedAyah : dict.quran.saveAyah}
                      </span>
                    </button>
                  </form>
                </div>

                <p dir="rtl" lang="ar" className="quran-text text-foreground">
                  {text}
                </p>
              </li>
            );
          })}
        </ol>

        <nav
          aria-label={dict.quran.reading}
          className="mt-8 flex flex-wrap items-center justify-between gap-3"
        >
          {number > 1 ? (
            <LinkButton
              href={`/${locale}/quran/${number - 1}`}
              variant="secondary"
              size="sm"
            >
              <ChevronLeft aria-hidden="true" className="flip-rtl size-4" strokeWidth={1.75} />
              {dict.quran.previousSurah}
            </LinkButton>
          ) : (
            <span />
          )}

          <Link
            href={`/${locale}/quran`}
            className="text-sm font-semibold text-forest underline-offset-4 hover:underline"
          >
            {dict.quran.backToIndex}
          </Link>

          {number < 114 ? (
            <LinkButton
              href={`/${locale}/quran/${number + 1}`}
              variant="secondary"
              size="sm"
            >
              {dict.quran.nextSurah}
              <ChevronRight aria-hidden="true" className="flip-rtl size-4" strokeWidth={1.75} />
            </LinkButton>
          ) : (
            <span />
          )}
        </nav>
      </Container>
    </>
  );
}
