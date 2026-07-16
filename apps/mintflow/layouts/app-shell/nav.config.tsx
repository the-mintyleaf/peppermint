"use client";

import { LeafIcon } from "@phosphor-icons/react/dist/csr/Leaf";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/csr/SquaresFour";
import { FolderOpenIcon } from "@phosphor-icons/react/dist/csr/FolderOpen";
import { CheckSquareIcon } from "@phosphor-icons/react/dist/csr/CheckSquare";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { KanbanIcon } from "@phosphor-icons/react/dist/csr/Kanban";
import { StarFourIcon } from "@phosphor-icons/react/dist/csr/StarFour";
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { SignOutIcon } from "@phosphor-icons/react/dist/csr/SignOut";

import { notifications } from "@peppermint/ui";

import type { AppShellConfig } from "./AppShell.types";

/**
 * Placeholder shell configuration for mintflow-admin. `/dashboard` and `/tasks`
 * are real routes; the rest are placeholders to rewire as routes land. Work
 * Files are dummy kanban boards. This file is `"use client"` and must be
 * imported directly by the client shell only — re-exporting an icon-importing
 * config through a barrel a Server Component evaluates caused an SSR 500 before.
 * Runtime `onNavigate` / `linkComponent` are injected by `LayoutAppShell`.
 */
export const APP_SHELL_CONFIG: Omit<
  AppShellConfig,
  "onNavigate" | "linkComponent"
> = {
  brand: {
    icon: LeafIcon,
    label: "kamban.",
    caption: "Minister workspace",
    href: "/dashboard",
  },

  groups: [
    {
      id: "menu",
      label: "Menu",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          href: "/dashboard",
          icon: SquaresFourIcon,
        },
        { id: "tasks", label: "Tasks", href: "/tasks", icon: CheckSquareIcon },
        { id: "cases", label: "Cases", href: "/cases", icon: FolderOpenIcon },
        {
          id: "calendar",
          label: "Calendar",
          href: "/calendar",
          icon: CalendarBlankIcon,
        },
        { id: "team", label: "Team", href: "/team", icon: UsersThreeIcon },
      ],
    },
    {
      id: "work-files",
      label: "Work Files",
      // Dummy kanban boards — swap for the real board list when wired.
      items: [
        {
          id: "cabinet",
          label: "Cabinet Priorities",
          href: "/work-files/cabinet-priorities",
          icon: KanbanIcon,
          badge: "12",
        },
        {
          id: "press",
          label: "Press & Comms",
          href: "/work-files/press-comms",
          icon: KanbanIcon,
          badge: "5",
        },
        {
          id: "budget",
          label: "Budget 2026",
          href: "/work-files/budget-2026",
          icon: KanbanIcon,
        },
        {
          id: "casework",
          label: "Constituency Casework",
          href: "/work-files/constituency-casework",
          icon: KanbanIcon,
          badge: "28",
        },
        {
          id: "legislation",
          label: "Legislation Tracker",
          href: "/work-files/legislation-tracker",
          icon: KanbanIcon,
        },
      ],
    },
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
      {
        id: "signout",
        label: "Sign out",
        icon: SignOutIcon,
        danger: true,
        // Placeholder — no auth yet; mirrors the app's "not connected" pattern.
        onClick: () =>
          notifications.show({ message: "Not connected yet", color: "gray" }),
      },
    ],
  },
};
