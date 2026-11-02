'use server';

import { revalidatePath } from 'next/cache';
import { getUserStorage } from '@/lib/storage';
import { getOrCreateUserId, getUserId } from '@/lib/user-cookie';

const QURAN = 'quran';

function parseAyahAnchor(surah: unknown, ayah: unknown): string | null {
  const s = Number(surah);
  const a = Number(ayah);
  if (!Number.isInteger(s) || s < 1 || s > 114) return null;
  if (!Number.isInteger(a) || a < 1) return null;
  return `${s}:${a}`;
}

function safeLocale(value: unknown): string {
  return value === 'en' ? 'en' : 'ar';
}

/** إضافة/إزالة علامة على آية. الحالة النهائية تُقرأ من التخزين لا من العميل. */
export async function toggleQuranBookmark(formData: FormData): Promise<void> {
  const anchor = parseAyahAnchor(formData.get('surah'), formData.get('ayah'));
  if (!anchor) return;
  const locale = safeLocale(formData.get('locale'));

  const userId = await getOrCreateUserId();
  const storage = getUserStorage();
  const exists = (await storage.listBookmarks(userId)).some(
    (bookmark) => bookmark.contentId === QURAN && bookmark.anchor === anchor,
  );

  if (exists) {
    await storage.removeBookmark(userId, QURAN, anchor);
  } else {
    await storage.addBookmark({ userId, contentId: QURAN, anchor });
  }

  revalidatePath(`/${locale}/quran/${anchor.split(':')[0]}`);
  revalidatePath(`/${locale}/bookmarks`);
}

/** إزالة علامة من صفحة العلامات. */
export async function removeQuranBookmark(formData: FormData): Promise<void> {
  const anchor = String(formData.get('anchor') ?? '');
  if (!/^\d{1,3}:\d{1,3}$/.test(anchor)) return;
  const locale = safeLocale(formData.get('locale'));

  const userId = await getUserId();
  if (!userId) return;

  await getUserStorage().removeBookmark(userId, QURAN, anchor);
  revalidatePath(`/${locale}/bookmarks`);
}
