import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type CardVariant = 'default' | 'muted' | 'highlight';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const variants: Record<CardVariant, string> = {
  default: 'border border-line bg-surface shadow-card',
  muted: 'border border-line bg-surface-muted',
  highlight: 'border border-gold/45 bg-gold-soft/60',
};

const paddings: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export function Card({
  children,
  className,
  variant = 'default',
  padding = 'md',
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
  padding?: CardPadding;
  as?: 'div' | 'section' | 'article' | 'li';
}) {
  return (
    <Tag className={cn('rounded-lg', variants[variant], paddings[padding], className)}>
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className="text-heading-sm font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
