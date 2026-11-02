import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex select-none items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-150 ease-[var(--ease-calm)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary shadow-soft hover:bg-primary-hover active:bg-primary',
  secondary:
    'border border-line-strong bg-surface text-foreground hover:bg-surface-muted active:bg-surface-sunken',
  ghost: 'text-foreground hover:bg-surface-muted active:bg-surface-sunken',
  gold: 'bg-gold text-on-gold shadow-soft hover:bg-gold-strong',
  danger:
    'border border-danger/25 bg-danger-surface text-danger hover:bg-danger-surface/80',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-6 text-base',
};

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonStyles({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
