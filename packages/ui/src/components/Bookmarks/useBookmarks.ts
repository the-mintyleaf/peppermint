'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Bookmark, BookmarkInput } from './bookmarks.types';
import {
  BOOKMARKS_CHANGED_EVENT,
  isBookmarked as checkBookmarked,
  readBookmarks,
  removeBookmark,
  toggleBookmark,
  writeBookmarks,
} from './bookmarks.utils';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const sync = useCallback(() => {
    setBookmarks(readBookmarks());
  }, []);

  useEffect(() => {
    sync();

    const handleChange = () => sync();
    window.addEventListener(BOOKMARKS_CHANGED_EVENT, handleChange);
    window.addEventListener('storage', handleChange);
    return () => {
      window.removeEventListener(BOOKMARKS_CHANGED_EVENT, handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, [sync]);

  const isBookmarked = useCallback(
    (id: string) => checkBookmarked(bookmarks, id),
    [bookmarks],
  );

  const toggle = useCallback(
    (input: BookmarkInput) => {
      const next = toggleBookmark(bookmarks, input);
      writeBookmarks(next);
      setBookmarks(next);
    },
    [bookmarks],
  );

  const remove = useCallback(
    (id: string) => {
      const next = removeBookmark(bookmarks, id);
      writeBookmarks(next);
      setBookmarks(next);
    },
    [bookmarks],
  );

  return { bookmarks, isBookmarked, toggle, remove };
}
