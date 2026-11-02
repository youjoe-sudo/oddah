import { cn } from '@/lib/cn';

export type StatusTone = 'planned' | 'verifying' | 'approved' | 'released' | 'blocked';

const tones: Record<StatusTone, string> = {
  planned: 'border-line-strong bg-surface-muted text-muted',
  verifying: 'border-warning/25 bg-warning-surface text-warning',
  approved: 'border-info/25 bg-info-surface text-info',
  released: 'border-success/25 bg-success-surface text-success',
  blocked: 'border-danger/25 bg-danger-surface text-danger',
};

const dots: Record<StatusTone, string> = {
  planned: 'bg-subtle',
  verifying: 'bg-warning',
  approved: 'bg-info',
  released: 'bg-success',
  blocked: 'bg-danger',
};

/**
 * شارة الحالة: تُستخدم لإظهار حالة المتطلب صراحةً
 * حتى لا تُعرض ميزة قيد التحقق كأنها جاهزة.
 * تعتمد على النص واللون معًا، لا اللون وحده.
 */
export function StatusBadge({
  tone,
  label,
  className,
}: {
  tone: StatusTone;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      <span aria-hidden="true" className={cn('size-1.5 rounded-pill', dots[tone])} />
      {label}
    </span>
  );
}
