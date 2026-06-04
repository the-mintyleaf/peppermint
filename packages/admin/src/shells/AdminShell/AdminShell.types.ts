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

export interface AdminShellActionButton {
  label: string;
  onClick: () => void;
  icon?: Icon;
  color?: string;
  badgeCount?: number;
}

export interface AdminShellHeaderConfig {
  greeting: string;
  adminName: string;
  actionButtons?: AdminShellActionButton[];
}
