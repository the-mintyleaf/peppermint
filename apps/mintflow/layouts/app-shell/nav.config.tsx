"use client";

import { LeafIcon } from "@phosphor-icons/react/dist/csr/Leaf";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/csr/SquaresFour";
import { FolderOpenIcon } from "@phosphor-icons/react/dist/csr/FolderOpen";
import { CheckSquareIcon } from "@phosphor-icons/react/dist/csr/CheckSquare";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { FilesIcon } from "@phosphor-icons/react/dist/csr/Files";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { StarFourIcon } from "@phosphor-icons/react/dist/csr/StarFour";
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { SignOutIcon } from "@phosphor-icons/react/dist/csr/SignOut";

import type { AppShellConfig } from "./AppShell.types";

/**
 * Placeholder shell configuration for mintflow-admin. Destinations, brand, and
 * footer are intentionally generic — rename/rewire them here as real routes
 * land. This file is `"use client"` and must be imported directly by the client
 * shell only: it pulls in Phosphor icons, and re-exporting it through a barrel
 * a Server Component evaluates caused an SSR 500 in the prior app-shell.
 *
 * Runtime navigation (`onNavigate`, `linkComponent`) is injected by
 * `LayoutAppShell` from the Next router — it is not part of this static config.
 */
export const APP_SHELL_CONFIG: Omit<
  AppShellConfig,
  "onNavigate" | "linkComponent"
> = {
  brand: { icon: LeafIcon, href: "/dashboard", label: "kamban." },

  nav: [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: SquaresFourIcon,
    },
    { id: "cases", label: "Cases", href: "/cases", icon: FolderOpenIcon },
    { id: "tasks", label: "Tasks", href: "/tasks", icon: CheckSquareIcon },
    {
      id: "calendar",
      label: "Calendar",
      href: "/calendar",
      icon: CalendarBlankIcon,
    },
    { id: "files", label: "Files", href: "/files", icon: FilesIcon },
    { id: "team", label: "Team", href: "/team", icon: UsersThreeIcon },
  ],

  aiButton: { href: "/ai", label: "Ask AI", icon: StarFourIcon },
  settingsButton: { href: "/settings", label: "Settings", icon: GearSixIcon },
  notifications: { href: "/notifications", count: 3 },

  user: {
    name: "John Minister",
    email: "john@kamban.gov",
    menuItems: [
      { id: "profile", label: "Profile", icon: UserIcon, href: "/settings" },
      {
        id: "settings",
        label: "Settings",
        icon: GearSixIcon,
        href: "/settings",
      },
      { id: "signout", label: "Sign out", icon: SignOutIcon, danger: true },
    ],
  },
};
