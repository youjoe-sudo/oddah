import { GraduationCap } from 'lucide-react';
import { resolvePage } from '@/i18n/page';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { FeatureList } from '@/components/ui/FeatureList';

type Props = { params: Promise<{ locale: string }> };

export default async function LearnPage({ params }: Props) {
  const { dict } = await resolvePage(params);

  const items = [
    {
      title: dict.learn.title,
      body: dict.learn.intro,
      tone: 'planned' as const,
      label: dict.status.planned,
      icon: GraduationCap,
    },
  ];

  return (
    <>
      <PageHeader title={dict.learn.title} intro={dict.learn.intro} />
      <Container className="py-8 md:py-10">
        <FeatureList items={items} />
      </Container>
    </>
  );
}
