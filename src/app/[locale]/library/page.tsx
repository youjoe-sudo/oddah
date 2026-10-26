import { resolvePage } from '@/i18n/page';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { FeatureList } from '@/components/ui/FeatureList';

type Props = { params: Promise<{ locale: string }> };

export default async function LibraryPage({ params }: Props) {
  const { dict } = await resolvePage(params);

  const items = [
    { title: dict.library.source, body: dict.library.intro, tone: 'planned' as const, label: dict.status.planned },
    { title: dict.library.license, body: dict.library.intro, tone: 'planned' as const, label: dict.status.planned },
  ];

  return (
    <>
      <PageHeader title={dict.library.title} intro={dict.library.intro} />
      <Container className="py-8">
        <FeatureList items={items} />
      </Container>
    </>
  );
}
