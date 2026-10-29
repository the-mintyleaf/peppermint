/**
 * Client-only `localStorage` helpers that never throw. `getItem`/`setItem` can throw
 * (quota exceeded, Safari private mode, a `SecurityError` when storage is blocked);
 * a failed write is kept in an in-memory overlay so the current tab keeps working,
 * and reads prefer that overlay. Each failure kind is reported once, not swallowed.
 * Every helper is a no-op / `null` on the server.
 */

/**
 * Overlay of failed writes. `value: null` is a tombstone for a remove that failed.
 * `shadowed` is what localStorage held when the overlay entry was made: once
 * localStorage holds something else (the app or another tab wrote it), the overlay
 * is stale and localStorage wins again.
 */
const memory = new Map<
  string,
  { value: string | null; shadowed: string | null }
>();
const warned = new Set<string>();

function warnOnce(kind: string, error: unknown): void {
  if (warned.has(kind)) return;
  warned.add(kind);
  console.warn(
    `[@peppermint/api-client] localStorage ${kind} failed; using in-memory storage for this tab.`,
    error,
  );
}

function rawRead(key: string): { ok: boolean; value: string | null } {
  try {
    return { ok: true, value: window.localStorage.getItem(key) };
  } catch (error) {
    warnOnce("read", error);
    return { ok: false, value: null };
  }
}

function overlay(key: string, value: string | null): void {
  memory.set(key, { value, shadowed: rawRead(key).value });
}

export function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  const raw = rawRead(key);
  const entry = memory.get(key);
  if (entry && (!raw.ok || raw.value === entry.shadowed)) return entry.value;
  memory.delete(key);
  return raw.value;
}

export function writeStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
    memory.delete(key);
  } catch (error) {
    warnOnce("write", error);
    overlay(key, value);
  }
}

export function removeStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
    memory.delete(key);
  } catch (error) {
    warnOnce("remove", error);
    overlay(key, null);
  }
}

/**
 * Read a browser cookie's **raw** value by name (client-only; `null` on the server).
 * The value is intentionally not URL-decoded: it is echoed verbatim into the
 * double-submit CSRF header so it matches the raw cookie the backend compares, and
 * a bare `%` in a token would otherwise make `decodeURIComponent` throw.
 */
export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  let cookie: string;
  try {
    cookie = document.cookie;
  } catch (error) {
    warnOnce("cookie read", error);
    return null;
  }
  const match = cookie.match(
    new RegExp(
      `(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`,
    ),
  );
  return match ? match[1] : null;
}
