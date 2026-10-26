import type { ReactNode } from 'react';
import { Container } from './Container';

export function PageHeader({
  title,
  intro,
  badge,
}: {
  title: string;
  intro: string;
  badge?: ReactNode;
}) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <Container className="py-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
          {badge}
        </div>
        <p className="mt-2 max-w-3xl text-slate-600">{intro}</p>
      </Container>
    </div>
  );
}
