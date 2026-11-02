import { cn } from '@/lib/cn';

/**
 * علامة ODDAH المؤقتة: قوس/محراب هندسي مبسّط + الاسم النصي.
 * تُستبدل بالملفات الرسمية (SVG) فور اعتمادها، دون تغيير التكوين.
 */
export function Brand({
  locale,
  onDark = false,
  compact = false,
  className,
}: {
  locale: 'ar' | 'en';
  onDark?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const arabic = locale === 'ar';

  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex size-10 shrink-0 items-center justify-center rounded-md border',
          onDark
            ? 'border-sidebar-line bg-white/5 text-gold'
            : 'border-line bg-surface text-brand',
        )}
      >
        <svg viewBox="0 0 44 44" fill="none" className="size-7">
          <path
            d="M22 5c8.3 0 15 6.7 15 15v18.5H7V20C7 11.7 13.7 5 22 5Z"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M22 12.5c4.7 0 8.5 3.8 8.5 8.5v10.5h-17V21c0-4.7 3.8-8.5 8.5-8.5Z"
            stroke="currentColor"
            strokeWidth="1.15"
            opacity="0.55"
          />
          <path
            d="M17.5 32.5V23a4.5 4.5 0 0 1 9 0v9.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="22" cy="22.75" r="1.2" fill="currentColor" />
        </svg>
      </span>

      {!compact ? (
        <span className="flex min-w-0 flex-col leading-none">
          <span
            className={cn(
              'truncate font-bold tracking-tight',
              arabic ? 'text-xl' : 'text-lg',
              onDark ? 'text-sidebar-foreground' : 'text-foreground',
            )}
          >
            {arabic ? 'عُدَّة' : 'ODDAH'}
          </span>
          <span
            className={cn(
              'mt-1.5 truncate text-[10px] font-medium tracking-[0.28em] uppercase',
              onDark ? 'text-sidebar-muted' : 'text-subtle',
            )}
          >
            {arabic ? 'ODDAH' : 'عُدَّة'}
          </span>
        </span>
      ) : null}
    </span>
  );
}
