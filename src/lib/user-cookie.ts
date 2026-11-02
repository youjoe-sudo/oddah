import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';

/**
 * هوية مؤقتة بلا حساب — تُستبدل بالمصادقة الحقيقية في CORE-01.
 * الكوكي HttpOnly، ولا يُستخدم أي شيء منها كبيانات ثقة خارج الخادم.
 */
export const USER_COOKIE = 'ip_uid';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** قراءة فقط — آمنة داخل مكوّنات العرض. */
export async function getUserId(): Promise<string | null> {
  const store = await cookies();
  return store.get(USER_COOKIE)?.value ?? null;
}

/** للاستخدام داخل Server Actions فقط (كتابة الكوكي ممنوعة أثناء العرض). */
export async function getOrCreateUserId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(USER_COOKIE)?.value;
  if (existing) return existing;

  const id = `demo_${randomUUID()}`;
  store.set(USER_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
  });
  return id;
}
