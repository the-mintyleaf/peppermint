import type { Icon } from "@phosphor-icons/react";
import type {
  AdminShellMainNavAdditional,
  AdminShellMainNavItem,
} from "./AdminShell.types";

export interface NavSpotlightTarget {
  id: string;
  label: string;
  description?: string;
  group?: string;
  href?: string;
  onClick?: () => void;
  icon?: Icon;
  keywords?: string | string[];
}

export function buildNavSpotlightTargets(
  mainNav: AdminShellMainNavItem[],
  additional?: AdminShellMainNavAdditional[],
): NavSpotlightTarget[] {
  const targets: NavSpotlightTarget[] = [];

  for (const item of mainNav) {
    if (item.kind === "page") {
      targets.push({
        id: item.id,
        label: item.label,
        group: "Navigation",
        href: item.href,
        icon: item.icon,
        keywords: item.label,
      });
      continue;
    }

    targets.push({
      id: `${item.id}-home`,
      label: item.label,
      description: "Open module",
      group: item.label,
      href: item.subNav.homeHref,
      icon: item.icon,
      keywords: [item.label, "module", "home"],
    });

    for (const group of item.subNav.groups) {
      for (const subItem of group.items) {
        targets.push({
          id: `${item.id}-${subItem.href}`,
          label: subItem.label,
          description: `${item.label} · ${group.label}`,
          group: item.label,
          href: subItem.href,
          icon: subItem.icon ?? item.icon,
          keywords: [item.label, group.label, subItem.label],
        });
      }
    }
  }

  for (const item of additional ?? []) {
    if (!item.href && !item.onClick) continue;

    targets.push({
      id: item.id,
      label: item.label,
      group: "More",
      href: item.href,
      onClick: item.onClick,
      icon: item.icon,
      keywords: item.label,
    });
  }

  return targets;
}
