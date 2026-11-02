import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** حالة فراغ موحدة: أيقونة + سبب واضح + إجراء اختياري. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  body,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-line-strong bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      <span className="mb-4 inline-flex size-12 items-center justify-center rounded-pill bg-surface-muted text-muted">
        <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
      </span>
      <h2 className="text-heading-sm font-semibold text-foreground">{title}</h2>
      {body ? <p className="mt-2 max-w-md text-sm text-muted">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
