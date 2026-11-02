import type { ReactNode } from 'react';
import { Container } from './Container';
import { cn } from '@/lib/cn';

/** رأس صفحة موحد: عنوان، وصف، شارة حالة، وإجراءات. */
export function PageHeader({
  title,
  intro,
  badge,
  eyebrow,
  actions,
  className,
}: {
  title: string;
  intro?: string;
  badge?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('border-b border-line bg-surface', className)}>
      <Container className="py-8 md:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            {eyebrow ? (
              <div className="mb-2 text-xs font-semibold tracking-[0.14em] text-gold-strong uppercase">
                {eyebrow}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-heading-lg font-bold text-foreground sm:text-display">
                {title}
              </h1>
              {badge}
            </div>
            {intro ? <p className="mt-3 max-w-2xl text-md text-muted">{intro}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
      </Container>
    </div>
  );
}
