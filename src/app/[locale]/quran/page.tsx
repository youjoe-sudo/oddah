import { resolvePage } from '@/i18n/page';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { FeatureList } from '@/components/ui/FeatureList';

type Props = { params: Promise<{ locale: string }> };

export default async function QuranPage({ params }: Props) {
  const { dict } = await resolvePage(params);

  const items = [
    { title: dict.quran.title, body: dict.quran.intro, tone: 'planned' as const, label: dict.status.planned },
    { title: dict.quran.search, body: dict.quran.source, tone: 'planned' as const, label: dict.status.planned },
    { title: dict.quran.bookmarks, body: dict.quran.source, tone: 'planned' as const, label: dict.status.planned },
  ];

  return (
    <>
      <PageHeader title={dict.quran.title} intro={dict.quran.intro} />
      <Container className="py-8">
        <FeatureList items={items} />
      </Container>
    </>
  );
}
