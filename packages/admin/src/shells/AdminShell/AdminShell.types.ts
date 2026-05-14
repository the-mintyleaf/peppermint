import type { Icon } from "@phosphor-icons/react";

export interface AdminShellNavItem {
  label: string;
  href: string;
  icon?: Icon;
  badge?: string;
}

export interface AdminShellNavGroup {
  label: string;
  items: AdminShellNavItem[];
}

export type AdminShellNav = AdminShellNavGroup[];
