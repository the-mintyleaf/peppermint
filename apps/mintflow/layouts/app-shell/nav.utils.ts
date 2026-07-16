import type { AppShellNavItem } from "./AppShell.types";

/**
 * Resolve the active destination for a pathname. A destination matches when the
 * path equals its href or is nested under it; the longest matching href wins so
 * that `/files/123/trail` highlights `Files`, not `/`.
 */
export function resolveActiveNavItem(
  items: AppShellNavItem[],
  pathname: string,
): AppShellNavItem | undefined {
  let match: AppShellNavItem | undefined;

  for (const item of items) {
    const isMatch =
      pathname === item.href || pathname.startsWith(`${item.href}/`);

    if (isMatch && (!match || item.href.length > match.href.length)) {
      match = item;
    }
  }

  return match;
}
