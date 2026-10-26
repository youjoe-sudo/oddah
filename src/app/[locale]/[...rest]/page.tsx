import { notFound } from 'next/navigation';

/**
 * أي مسار غير معروف تحت لغة مدعومة يُظهر صفحة 404 المحلية
 * (`[locale]/not-found.tsx`) بدل 404 الافتراضية بالإنجليزية.
 *
 * `instant = false` يسمح بمسار يُبني عند الطلب (cacheComponents)،
 * حتى لا يُثبَّت غلاف 404 الافتراضي كصفحة ثابتة أثناء البناء.
 */
export const instant = false;

export default function CatchAllPage() {
  notFound();
}
