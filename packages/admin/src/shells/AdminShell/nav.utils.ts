import type {
  AdminShellMainNavItem,
  AdminShellMainNavModule,
} from "./AdminShell.types";

export function matchesPath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
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
