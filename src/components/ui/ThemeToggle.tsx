'use client';

import { useLayoutEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { IconButton } from './IconButton';

const STORAGE_KEY = 'odda-theme';

/** مبدّل الثيم: يحفظ الاختيار ويعيد تطبيقه قبل الرسم. */
export function ThemeToggle({ label }: { label: string }) {
  // إعادة التطبيق بعد إعادة تركيب React في وضع التطوير (لا أثر في الإنتاج).
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        document.documentElement.dataset.theme = saved;
      }
    } catch {
      /* التخزين المحلي غير متاح */
    }
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* التخزين المحلي غير متاح */
    }
  }

  return (
    <IconButton label={label} onClick={toggleTheme} aria-live="polite">
      <Moon aria-hidden="true" className="size-5 dark:hidden" strokeWidth={1.75} />
      <Sun aria-hidden="true" className="hidden size-5 dark:block" strokeWidth={1.75} />
    </IconButton>
  );
}
