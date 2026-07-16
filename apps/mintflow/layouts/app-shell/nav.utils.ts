import type { AppShellNavGroup, AppShellNavItem } from "./AppShell.types";

/** A route is active when the path equals its href or is nested under it. */
export function isActiveHref(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Flatten every group's items into a single list. */
export function flattenNavItems(groups: AppShellNavGroup[]): AppShellNavItem[] {
  return groups.flatMap((group) => group.items);
}

/**
 * Resolve the active destination href across all groups. The longest matching
 * href wins so `/files/123/trail` highlights `Files`, not a shorter prefix.
 */
export function resolveActiveHref(
  groups: AppShellNavGroup[],
  pathname: string,
): string | undefined {
  let best: string | undefined;

  for (const item of flattenNavItems(groups)) {
    if (
      isActiveHref(pathname, item.href) &&
      (!best || item.href.length > best.length)
    ) {
      best = item.href;
    }
  }

  return best;
}
