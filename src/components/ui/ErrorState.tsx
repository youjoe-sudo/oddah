import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** حالة خطأ موحدة مع إجراء استرداد. */
export function ErrorState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-start gap-3 rounded-lg border border-danger/25 bg-danger-surface p-5 text-danger',
        className,
      )}
    >
      <div className="flex items-center gap-2 font-semibold">
        <AlertTriangle aria-hidden="true" className="size-5" strokeWidth={1.75} />
        <h2>{title}</h2>
      </div>
      {body ? <p className="text-sm">{body}</p> : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
