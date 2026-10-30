import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolvePage } from '@/i18n/page';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getContentStorage } from '@/lib/storage';

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
      <Container className="py-8">
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900">{dict.quran.textSourceNotice}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-amber-800">
            <span>{dict.library.source}:</span>
            <a
              href={meta.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="underline"
            >
              {meta.sourceName}
            </a>
            <span>· {meta.license}</span>
            <a href={meta.licenseUrl} target="_blank" rel="noreferrer noopener" className="underline">
              {meta.licenseUrl}
            </a>
          </p>
        </Card>

        <ol className="space-y-3">
          {ayahs.map((text, index) => (
            <li
              key={index}
              id={`ayah-${index + 1}`}
              className="flex scroll-mt-24 items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600 tabular-nums">
                {formatNumber(index + 1)}
              </span>
              <p
                dir="rtl"
                lang="ar"
                className="flex-1 text-right font-serif text-xl leading-loose text-slate-900"
              >
                {text}
              </p>
            </li>
          ))}
        </ol>

        <nav className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm">
          {number > 1 ? (
            <Link href={`/${locale}/quran/${number - 1}`} className="text-sky-700 underline">
              ← {dict.quran.previousSurah}
            </Link>
          ) : (
            <span />
          )}
          <Link href={`/${locale}/quran`} className="font-medium text-slate-700 underline">
            {dict.quran.backToIndex}
          </Link>
          {number < 114 ? (
            <Link href={`/${locale}/quran/${number + 1}`} className="text-sky-700 underline">
              {dict.quran.nextSurah} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </Container>
    </>
  );
}
