import { BookOpen } from 'lucide-react';
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

      <Container className="py-8 md:py-10">
        <ul className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => {
            const source = sourceById.get(item.sourceId);
            const verified = source?.verificationStatus === 'verified';

            return (
              <li key={item.id}>
                <Card className="flex h-full flex-col" padding="md">
                  <div className="flex items-start gap-3.5">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-gold-soft text-gold-strong"
                    >
                      <BookOpen className="size-5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2 className="text-heading-sm font-semibold text-foreground">
                          {locale === 'ar' ? item.titleAr : item.titleEn}
                        </h2>
                        <StatusBadge
                          tone={statusTone[item.status]}
                          label={dict.library.status[item.status]}
                        />
                      </div>
                      <p className="mt-2 text-sm text-muted">
                        {locale === 'ar' ? item.descriptionAr : item.descriptionEn}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-5 flex-1 space-y-1.5 border-t border-line pt-3 text-xs text-muted">
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="font-semibold text-foreground">{dict.library.source}:</dt>
                      <dd>{source ? (locale === 'ar' ? source.nameAr : source.nameEn) : item.sourceId}</dd>
                    </div>
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="font-semibold text-foreground">{dict.library.license}:</dt>
                      <dd>{source?.license ?? '—'}</dd>
                    </div>
                  </dl>

                  <div className="mt-3">
                    <StatusBadge
                      tone={verified ? 'released' : 'blocked'}
                      label={verified ? dict.library.verifiedSource : dict.library.unverifiedSource}
                    />
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </Container>
    </>
  );
}
