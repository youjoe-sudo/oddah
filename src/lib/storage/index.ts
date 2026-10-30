import { getEnv } from '../env';
import { jsonContentStorage, jsonUserStorage } from './json';

/**
 * نقطة الوصول الوحيدة إلى البيانات.
 *
 * الواجهة نفسها يطبّقها المزوّد المحلي (JSON) الآن، وسيطبّقها مزوّد
 * PostgreSQL/Supabase لاحقًا بنفس التواقيع — فتبديل التخزين لا يمسّ الصفحات.
 *
 * التبديل: DATA_PROVIDER=postgres بعد تنفيذ docs/08-supabase-setup.md.
 */

export type ContentStorage = typeof jsonContentStorage;
export type UserStorage = typeof jsonUserStorage;

export function getContentStorage(): ContentStorage {
  const provider = getEnv().DATA_PROVIDER;
  switch (provider) {
    case 'json':
      return jsonContentStorage;
    case 'postgres':
      throw new Error(
        'DATA_PROVIDER=postgres غير مفعّل بعد: نفّذ docs/08-supabase-setup.md ثم أضف مزوّد Postgres. ' +
          'حتى ذلك الحين استخدم DATA_PROVIDER=json (docs/09-local-json-storage.md).',
      );
    default: {
      // حماية من قيمة غير متوقعة لو أُضيف خيار جديد في env دون تنفيذ هنا
      const exhaustive: never = provider;
      throw new Error(`Unsupported DATA_PROVIDER: ${String(exhaustive)}`);
    }
  }
}

export function getUserStorage(): UserStorage {
  const provider = getEnv().DATA_PROVIDER;
  if (provider === 'json') return jsonUserStorage;
  throw new Error(
    'تخزين حالة المستخدم غير مفعّل على Postgres بعد — راجع docs/09-local-json-storage.md',
  );
}

export type { Adhkar, Bookmark, ContentStatus, LibraryItem, Source, Surah } from './schemas';
