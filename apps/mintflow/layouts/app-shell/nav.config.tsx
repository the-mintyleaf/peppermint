"use client";

import type { Icon } from "@phosphor-icons/react";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
import { ChartBarIcon } from "@phosphor-icons/react/dist/csr/ChartBar";
import { FolderSimpleIcon } from "@phosphor-icons/react/dist/csr/FolderSimple";

export interface NavDestination {
  id: string;
  label: string;
  href: string;
  icon: Icon;
}

/**
 * The four primary Kamban destinations, shared by the mobile bottom-nav pill
 * and the desktop icon rail. The ＋ create action sits between Tasks and
 * Reports on mobile and is rendered separately (it opens the Create Task sheet,
 * it is not a destination).
 */
export const NAV_DESTINATIONS: NavDestination[] = [
  { id: "home", label: "Home", href: "/home", icon: HouseIcon },
  { id: "tasks", label: "Tasks", href: "/tasks", icon: ListChecksIcon },
  { id: "dashboard", label: "Reports", href: "/dashboard", icon: ChartBarIcon },
  { id: "files", label: "Files", href: "/files", icon: FolderSimpleIcon },
];

/** True when `pathname` is within a destination's route subtree. */
export function isDestinationActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
