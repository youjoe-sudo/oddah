export type StatusTone = 'planned' | 'verifying' | 'approved' | 'released';

const tones: Record<StatusTone, string> = {
  planned: 'bg-slate-100 text-slate-700 border-slate-200',
  verifying: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-sky-100 text-sky-800 border-sky-200',
  released: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

/**
 * شارة الحالة: تُستخدم لإظهار حالة المتطلب صراحةً
 * حتى لا تُعرض ميزة قيد التحقق كأنها جاهزة.
 */
export function StatusBadge({ tone, label }: { tone: StatusTone; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {label}
    </span>
  );
}
