import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type IconButtonVariant = 'ghost' | 'secondary';

const variants: Record<IconButtonVariant, string> = {
  ghost: 'text-muted hover:bg-surface-muted hover:text-foreground',
  secondary:
    'border border-line-strong bg-surface text-foreground hover:bg-surface-muted',
};

/** زر أيقونة بمساحة لمس 44×44px واسم وصول إلزامي. */
export function IconButton({
  label,
  variant = 'ghost',
  className,
  children,
  ...props
}: ComponentProps<'button'> & {
  label: string;
  variant?: IconButtonVariant;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-md transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
