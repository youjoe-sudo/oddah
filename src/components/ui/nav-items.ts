import {
  AudioLines,
  Bookmark,
  BookOpen,
  Clock,
  GraduationCap,
  Home,
  Library,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export type NavKey =
  | 'home'
  | 'quran'
  | 'prayer'
  | 'library'
  | 'learn'
  | 'studio'
  | 'bookmarks'
  | 'admin';

export type NavItem = {
  key: NavKey;
  path: string;
  icon: LucideIcon;
};

/** التنقل الأساسي الموحد لكل الواجهات. */
export const primaryNav: NavItem[] = [
  { key: 'home', path: '', icon: Home },
  { key: 'quran', path: 'quran', icon: BookOpen },
  { key: 'prayer', path: 'prayer', icon: Clock },
  { key: 'library', path: 'library', icon: Library },
  { key: 'learn', path: 'learn', icon: GraduationCap },
  { key: 'studio', path: 'studio', icon: AudioLines },
  { key: 'bookmarks', path: 'bookmarks', icon: Bookmark },
  { key: 'admin', path: 'admin', icon: ShieldCheck },
];

/** عناصر الشريط السفلي على الجوال — أهم خمسة مسارات. */
export const bottomNavKeys: NavKey[] = ['home', 'quran', 'prayer', 'library', 'bookmarks'];

export const bottomNav = primaryNav.filter((item) => bottomNavKeys.includes(item.key));

export function hrefFor(locale: string, path: string): string {
  return path ? `/${locale}/${path}` : `/${locale}`;
}

export function isNavActive(pathname: string, locale: string, path: string): boolean {
  const home = `/${locale}`;
  if (!path) return pathname === home || pathname === `${home}/`;
  return pathname === `${home}/${path}` || pathname.startsWith(`${home}/${path}/`);
}
