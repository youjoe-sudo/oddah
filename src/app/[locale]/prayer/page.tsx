import { CalendarDays, Clock, Compass, Heart } from 'lucide-react';
import { resolvePage } from '@/i18n/page';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { FeatureList } from '@/components/ui/FeatureList';

type Props = { params: Promise<{ locale: string }> };

export default async function PrayerPage({ params }: Props) {
  const { dict } = await resolvePage(params);

  const items = [
    {
      title: dict.prayer.times,
      body: dict.prayer.intro,
      tone: 'planned' as const,
      label: dict.status.planned,
      icon: Clock,
    },
    {
      title: dict.prayer.qibla,
      body: dict.prayer.intro,
      tone: 'planned' as const,
      label: dict.status.planned,
      icon: Compass,
    },
    {
      title: dict.prayer.adhkar,
      body: dict.prayer.intro,
      tone: 'planned' as const,
      label: dict.status.planned,
      icon: Heart,
    },
    {
      title: dict.prayer.calendar,
      body: dict.prayer.intro,
      tone: 'planned' as const,
      label: dict.status.planned,
      icon: CalendarDays,
    },
  ];

  return (
    <>
      <PageHeader title={dict.prayer.title} intro={dict.prayer.intro} />
      <Container className="py-8 md:py-10">
        <FeatureList items={items} />
      </Container>
    </>
  );
}
