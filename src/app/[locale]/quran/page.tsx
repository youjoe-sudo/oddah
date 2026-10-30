import { resolvePage } from '@/i18n/page';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
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
      />
      <Container className="py-8">
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">{dict.quran.index}</h2>
          <p className="mt-2 text-sm text-slate-600">{dict.quran.metadataNotice}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <span>{dict.library.source}:</span>
            {meta.sourceUrl ? (
              <a
                href={meta.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sky-700 underline"
              >
                {meta.sourceName ?? meta.sourceUrl}
              </a>
            ) : (
              <span>{meta.sourceName ?? '—'}</span>
            )}
            {meta.fetchedAt && <span>· {meta.fetchedAt}</span>}
            <span>
              · {surahs.length} {dict.quran.surahUnit}
            </span>
          </p>
        </Card>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-start text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" className="px-3 py-3 text-start font-medium">
                  {dict.quran.number}
                </th>
                <th scope="col" className="px-3 py-3 text-start font-medium">
                  {dict.quran.surah}
                </th>
                <th scope="col" className="px-3 py-3 text-start font-medium">
                  {dict.quran.ayahs}
                </th>
                <th scope="col" className="px-3 py-3 text-start font-medium">
                  {dict.quran.revelation}
                </th>
              </tr>
            </thead>
            <tbody>
              {surahs.map((surah) => (
                <tr key={surah.number} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-500 tabular-nums">{surah.number}</td>
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {locale === 'ar' ? surah.nameAr : surah.nameEn}
                    {locale === 'en' && (
                      <span className="block text-xs font-normal text-slate-500">
                        {surah.translationEn}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-600 tabular-nums">{surah.ayahCount}</td>
                  <td className="px-3 py-2 text-slate-600">
                    {surah.revelation === 'meccan' ? dict.quran.meccan : dict.quran.medinan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </>
  );
}
