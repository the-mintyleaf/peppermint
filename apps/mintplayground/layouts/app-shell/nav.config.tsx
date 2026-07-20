"use client";

import { LeafIcon } from "@phosphor-icons/react/dist/csr/Leaf";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { PaletteIcon } from "@phosphor-icons/react/dist/csr/Palette";
import { StackIcon } from "@phosphor-icons/react/dist/csr/Stack";
import { FlaskIcon } from "@phosphor-icons/react/dist/csr/Flask";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { StarFourIcon } from "@phosphor-icons/react/dist/csr/StarFour";
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";

import type { AppShellConfig } from "./AppShell.types";

/**
 * Shell configuration for mintplayground. `/home` is the only route that
 * exists — the Sandbox group is placeholders, kept so the nav has enough shape
 * to design against and so there is an obvious place to hang the next
 * experiment. `Staff only` carries `requiresStaff` to exercise the role filter
 * in `LayoutAppShell` (sign in as `officer` and it disappears).
 *
 * This file is `"use client"` and must be imported directly by the client shell
 * only — re-exporting an icon-importing config through a barrel a Server
 * Component evaluates caused an SSR 500 before. Runtime `onNavigate` /
 * `linkComponent` are injected by `LayoutAppShell`.
 */
export const APP_SHELL_CONFIG: Omit<
  AppShellConfig,
  "onNavigate" | "linkComponent"
> = {
  brand: {
    icon: LeafIcon,
    label: "mintplayground.",
    caption: "Frontend sandbox",
    href: "/home",
  },

  groups: [
    {
      id: "menu",
      label: "Menu",
      items: [{ id: "home", label: "Home", href: "/home", icon: HouseIcon }],
    },
    {
      id: "sandbox",
      label: "Sandbox",
      // Placeholders — no routes behind these yet. Build one, then point it here.
      items: [
        {
          id: "components",
          label: "Components",
          href: "/sandbox/components",
          icon: StackIcon,
        },
        {
          id: "tokens",
          label: "Design tokens",
          href: "/sandbox/tokens",
          icon: PaletteIcon,
        },
        {
          id: "scratch",
          label: "Scratch",
          href: "/sandbox/scratch",
          icon: FlaskIcon,
        },
        {
          id: "staff-only",
          label: "Staff only",
          href: "/sandbox/staff-only",
          icon: ShieldCheckIcon,
          requiresStaff: true,
        },
      ],
    },
  ],

  aiButton: { href: "/ai", label: "Ask AI", icon: StarFourIcon },
  settingsButton: { href: "/settings", label: "Settings", icon: GearSixIcon },
  notifications: { href: "/notifications", count: 3 },

  // `user` is injected at runtime by `LayoutAppShell` from the signed-in account
  // (`/api/v1/auth/me/`) — its menu wires the account modal + sign-out.
};
