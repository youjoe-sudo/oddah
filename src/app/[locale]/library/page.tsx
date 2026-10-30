import { resolvePage } from '@/i18n/page';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge, type StatusTone } from '@/components/ui/StatusBadge';
import { getContentStorage, type ContentStatus } from '@/lib/storage';

type Props = { params: Promise<{ locale: string }> };

const statusTone: Record<ContentStatus, StatusTone> = {
  draft: 'planned',
  planned: 'planned',
  in_review: 'verifying',
  approved: 'approved',
  published: 'released',
  rejected: 'blocked',
};

export default async function LibraryPage({ params }: Props) {
  const { locale, dict } = await resolvePage(params);
  const storage = getContentStorage();
  const [items, sources] = await Promise.all([storage.listLibraryItems(), storage.listSources()]);
  const sourceById = new Map(sources.map((source) => [source.id, source]));

  return (
    <>
      <PageHeader
        title={dict.library.title}
        intro={dict.library.intro}
        badge={<StatusBadge tone="verifying" label={dict.library.demoData} />}
      />
      <Container className="py-8">
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const source = sourceById.get(item.sourceId);
            const verified = source?.verificationStatus === 'verified';
            return (
              <Card key={item.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-slate-900">
                    {locale === 'ar' ? item.titleAr : item.titleEn}
                  </h2>
                  <StatusBadge
                    tone={statusTone[item.status]}
                    label={dict.library.status[item.status]}
                  />
                </div>
                <p className="mt-2 flex-1 text-sm text-slate-600">
                  {locale === 'ar' ? item.descriptionAr : item.descriptionEn}
                </p>
                <dl className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-medium text-slate-600">{dict.library.source}:</dt>
                    <dd>{source ? (locale === 'ar' ? source.nameAr : source.nameEn) : item.sourceId}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-medium text-slate-600">{dict.library.license}:</dt>
                    <dd>{source?.license ?? '—'}</dd>
                  </div>
                </dl>
                <div className="mt-3">
                  <StatusBadge
                    tone={verified ? 'released' : 'blocked'}
                    label={
                      verified ? dict.library.verifiedSource : dict.library.unverifiedSource
                    }
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </>
  );
}
