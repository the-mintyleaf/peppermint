import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // Always `initial` on the first render so server and client HTML match; the
  // stored value is read after mount to avoid a hydration mismatch / flash.
  const [stored, setStored] = useState<T>(initial);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item != null) setStored(JSON.parse(item) as T);
    } catch {
      // Corrupt/unavailable storage — keep the initial value.
    }
    // Re-read when the key changes; `initial` is intentionally not a dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next =
          typeof value === "function" ? (value as (p: T) => T)(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [key],
  );

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== key) return;
      try {
        setStored(e.newValue ? (JSON.parse(e.newValue) as T) : initial);
      } catch {}
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, initial]);

  return [stored, setValue];
}
