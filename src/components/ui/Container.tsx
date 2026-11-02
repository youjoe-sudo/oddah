import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** حاوية موحدة: محتوى مركزي بحد أقصى 1440px وهوامش متجاوبة. */
export function Container({
  children,
  className = '',
  size = 'default',
}: {
  children: ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'wide';
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        size === 'default' && 'max-w-[1440px] px-4 sm:px-6 lg:px-8',
        size === 'narrow' && 'max-w-3xl px-4 sm:px-6',
        size === 'wide' && 'max-w-[1600px] px-4 sm:px-6 lg:px-8',
        className,
      )}
    >
      {children}
    </div>
  );
}
