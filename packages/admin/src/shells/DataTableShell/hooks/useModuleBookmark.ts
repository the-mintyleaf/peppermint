'use client';

import { useCallback, useEffect, useState } from 'react';

function bookmarkKey(storageKey: string) {
  return `peppermint:module-bookmark:${storageKey}`;
}

export function useModuleBookmark(storageKey: string) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    try {
      setBookmarked(localStorage.getItem(bookmarkKey(storageKey)) === '1');
    } catch {
      setBookmarked(false);
    }
  }, [storageKey]);

  const toggle = useCallback(() => {
    setBookmarked((prev) => {
      const next = !prev;
      try {
        if (next) {
          localStorage.setItem(bookmarkKey(storageKey), '1');
        } else {
          localStorage.removeItem(bookmarkKey(storageKey));
        }
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, [storageKey]);

  return { bookmarked, toggle };
}
