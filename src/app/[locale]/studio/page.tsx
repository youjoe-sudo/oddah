import { resolvePage } from '@/i18n/page';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { FeatureList } from '@/components/ui/FeatureList';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card } from '@/components/ui/Card';

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
    },
    {
      title: dict.studio.creator.heading,
      body: dict.studio.creator.body,
      tone: 'verifying' as const,
      label: dict.status.verifying,
    },
  ];

  return (
    <>
      <PageHeader
        title={dict.studio.title}
        intro={dict.studio.intro}
        badge={<StatusBadge tone="verifying" label={dict.status.verifying} />}
      />
      <Container className="space-y-6 py-8">
        <FeatureList items={items} />
        <Card>
          <p className="text-sm font-medium text-amber-800">{dict.studio.gate}</p>
        </Card>
      </Container>
    </>
  );
}
