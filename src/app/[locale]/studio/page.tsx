import { AlertTriangle, AudioLines, Clapperboard } from 'lucide-react';
import { resolvePage } from '@/i18n/page';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { FeatureList } from '@/components/ui/FeatureList';
import { StatusBadge } from '@/components/ui/StatusBadge';

type Props = { params: Promise<{ locale: string }> };

/**
 * صفحة إظهار حالة المسار التجريبي: لا تُعرض أي أداة هنا كأنها جاهزة،
 * بل تُعرض حصيلة التحقق فقط (انظر docs/02-poc-audio.md و docs/03-poc-youtube.md).
 */
export default async function StudioPage({ params }: Props) {
  const { dict } = await resolvePage(params);

  const items = [
    {
      title: dict.studio.audio.heading,
      body: dict.studio.audio.body,
      tone: 'verifying' as const,
      label: dict.status.verifying,
      icon: AudioLines,
    },
    {
      title: dict.studio.creator.heading,
      body: dict.studio.creator.body,
      tone: 'verifying' as const,
      label: dict.status.verifying,
      icon: Clapperboard,
    },
  ];

  return (
    <>
      <PageHeader
        title={dict.studio.title}
        intro={dict.studio.intro}
        badge={<StatusBadge tone="verifying" label={dict.status.verifying} />}
      />

      <Container className="space-y-6 py-8 md:py-10">
        <FeatureList items={items} />

        <div className="flex items-start gap-3 rounded-lg border border-warning/25 bg-warning-surface p-5 text-warning">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" strokeWidth={1.75} />
          <p className="text-sm font-medium">{dict.studio.gate}</p>
        </div>
      </Container>
    </>
  );
}
