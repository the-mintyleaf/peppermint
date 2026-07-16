import type { AppShellNavItem } from "./AppShell.types";

/** A route is active when the path equals its href or is nested under it. */
export function isActiveHref(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Resolve the active destination for a pathname. The longest matching href wins
 * so that `/files/123/trail` highlights `Files`, not `/`.
 */
export function resolveActiveNavItem(
  items: AppShellNavItem[],
  pathname: string,
): AppShellNavItem | undefined {
  let match: AppShellNavItem | undefined;

  for (const item of items) {
    if (
      isActiveHref(pathname, item.href) &&
      (!match || item.href.length > match.href.length)
    ) {
      match = item;
    }
  }

  return match;
}
