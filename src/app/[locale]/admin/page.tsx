import { resolvePage } from '@/i18n/page';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { FeatureList } from '@/components/ui/FeatureList';

type Props = { params: Promise<{ locale: string }> };

export default async function AdminPage({ params }: Props) {
  const { dict, locale } = await resolvePage(params);

  const items = [
    { title: dict.nav.admin, body: dict.home.status.body, tone: 'planned' as const, label: dict.status.planned },
    { title: dict.library.title, body: dict.library.intro, tone: 'planned' as const, label: dict.status.planned },
  ];

  return (
    <>
      <PageHeader title={`${dict.nav.admin} — ${locale.toUpperCase()}`} intro={dict.home.status.body} />
      <Container className="py-8">
        <FeatureList items={items} />
      </Container>
    </>
  );
}
