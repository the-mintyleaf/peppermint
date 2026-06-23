import type { Bookmark } from './bookmarks.types';

export const BOOKMARKS_STORAGE_KEY = 'peppermint:bookmarks';
export const BOOKMARKS_CHANGED_EVENT = 'peppermint:bookmarks-changed';

export function resolveBookmarkHref(): string {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname;
}

export function formatHrefAsBreadcrumb(href: string): string {
  const segments = href.split('/').filter(Boolean);
  if (segments.length === 0) return 'Home';

  return segments
    .map((segment) =>
      segment
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
    )
    .join(' / ');
}

export function readBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is Bookmark =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Bookmark).id === 'string' &&
        typeof (item as Bookmark).label === 'string' &&
        typeof (item as Bookmark).href === 'string' &&
        typeof (item as Bookmark).createdAt === 'string',
    );
  } catch {
    return [];
  }
}

export function writeBookmarks(bookmarks: Bookmark[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    window.dispatchEvent(new CustomEvent(BOOKMARKS_CHANGED_EVENT));
  } catch {
    // ignore storage errors
  }
}

export function isBookmarked(bookmarks: Bookmark[], id: string): boolean {
  return bookmarks.some((bookmark) => bookmark.id === id);
}

export function toggleBookmark(
  bookmarks: Bookmark[],
  input: { id: string; label: string; href?: string },
): Bookmark[] {
  const href = input.href ?? resolveBookmarkHref();
  const existing = bookmarks.find((bookmark) => bookmark.id === input.id);
  if (existing) {
    return bookmarks.filter((bookmark) => bookmark.id !== input.id);
  }
  return [
    ...bookmarks,
    {
      id: input.id,
      label: input.label,
      href,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function removeBookmark(bookmarks: Bookmark[], id: string): Bookmark[] {
  return bookmarks.filter((bookmark) => bookmark.id !== id);
}
