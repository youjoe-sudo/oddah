import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** حقل إدخال موحد. يجب توفير label مرئي أو aria-label دائم. */
export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'min-h-11 w-full rounded-md border border-line-strong bg-surface px-4 text-md text-foreground shadow-soft transition-colors placeholder:text-subtle focus:border-forest focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
