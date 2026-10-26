import { LocalizedNotFound } from '@/components/ui/LocalizedNotFound';

/**
 * الـ 404 الجذرية: تُستخدم لأي مسار لا يطابق مسارًا مسجّلًا.
 * تعرض النص باللغة المستخدمة في المسار (ar/en).
 */
export default function RootNotFound() {
  return <LocalizedNotFound />;
}
