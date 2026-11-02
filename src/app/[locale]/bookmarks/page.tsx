import Link from 'next/link';
import { Bookmark, Trash2 } from 'lucide-react';
import { resolvePage } from '@/i18n/page';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button, LinkButton } from '@/components/ui/Button';
import { getContentStorage, getUserStorage } from '@/lib/storage';
import { getUserId } from '@/lib/user-cookie';
import { removeQuranBookmark } from '../quran/[surah]/actions';

export const instant = false;

type Props = { params: Promise<{ locale: string }> };

export default async function BookmarksPage({ params }: Props) {
  const { locale, dict } = await resolvePage(params);
  const userId = await getUserId();

  const rows = userId
    ? (await getUserStorage().listBookmarks(userId))
        .filter((bookmark) => bookmark.contentId === 'quran')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  const storage = getContentStorage();
  const { surahs } = await storage.getQuranIndex();
  const surahByNumber = new Map(surahs.map((surah) => [surah.number, surah]));
  const textCache = new Map<number, string[]>();

  const items = [];
  for (const bookmark of rows) {
    const [surahNumber, ayahNumber] = bookmark.anchor.split(':').map(Number);
    const surah = surahByNumber.get(surahNumber);
    if (!surah || !Number.isInteger(ayahNumber) || ayahNumber < 1) continue;

    if (!textCache.has(surahNumber)) {
      const doc = await storage.getSurahText(surahNumber);
      textCache.set(surahNumber, doc?.ayahs ?? []);
    }
    const text = textCache.get(surahNumber)?.[ayahNumber - 1];
    if (!text) continue;

    items.push({ bookmark, surah, ayahNumber, text });
  }

  return (
    <>
      <PageHeader title={dict.bookmarks.title} intro={dict.bookmarks.intro} />

      <Container className="py-8 md:py-10">
        {items.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title={dict.bookmarks.title}
            body={dict.bookmarks.empty}
            action={
              <LinkButton href={`/${locale}/quran`} variant="secondary">
                {dict.home.cta.quran}
              </LinkButton>
            }
          />
        ) : (
          <ul className="space-y-3">
            {items.map(({ bookmark, surah, ayahNumber, text }) => {
              const surahName = locale === 'ar' ? surah.nameAr : surah.nameEn;

              return (
                <li key={`${bookmark.contentId}:${bookmark.anchor}`}>
                  <Card padding="md">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/${locale}/quran/${surah.number}#ayah-${ayahNumber}`}
                        className="inline-flex min-h-9 items-center text-sm font-semibold text-forest underline-offset-4 hover:underline"
                      >
                        {surahName} · {dict.quran.ayahLabel} {ayahNumber}
                      </Link>

                      <form action={removeQuranBookmark}>
                        <input type="hidden" name="anchor" value={bookmark.anchor} />
                        <input type="hidden" name="locale" value={locale} />
                        <Button
                          type="submit"
                          variant="danger"
                          size="sm"
                          className="min-h-11"
                          aria-label={`${dict.bookmarks.remove} — ${surahName} ${ayahNumber}`}
                        >
                          <Trash2 aria-hidden="true" className="size-4" strokeWidth={1.75} />
                          {dict.bookmarks.remove}
                        </Button>
                      </form>
                    </div>

                    <p dir="rtl" lang="ar" className="quran-text mt-3 text-foreground">
                      {text}
                    </p>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </>
  );
}
