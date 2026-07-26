import type {
  AdminShellMainNavItem,
  AdminShellMainNavModule,
} from "./AdminShell.types";

export function matchesPath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * Resolves the single active href from a set of candidates. When several hrefs
 * match the pathname (e.g. a list route `/x` and its nested `/x/child`), the
 * longest — most specific — match wins, so only one item highlights.
 */
export function resolveActiveHref(
  pathname: string,
  hrefs: string[],
): string | null {
  let active: string | null = null;
  for (const href of hrefs) {
    if (matchesPath(pathname, href) && href.length > (active?.length ?? -1)) {
      active = href;
    }
  }
  return active;
}

export function moduleMatches(
  pathname: string,
  module: AdminShellMainNavModule,
): boolean {
  if (matchesPath(pathname, module.subNav.homeHref)) return true;
  return module.subNav.groups.some((group) =>
    group.items.some((item) => matchesPath(pathname, item.href)),
  );
}

export function resolveActiveMainNavItem(
  mainNav: AdminShellMainNavItem[],
  pathname: string,
): AdminShellMainNavItem | null {
  for (const item of mainNav) {
    if (item.kind === "module" && moduleMatches(pathname, item)) return item;
  }

  for (const item of mainNav) {
    if (item.kind === "page" && pathname === item.href) return item;
  }

  return null;
}
