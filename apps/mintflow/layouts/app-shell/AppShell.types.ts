import type { ElementType } from "react";
import type { Icon } from "@phosphor-icons/react";

/** A primary destination in the rail. */
export interface AppShellNavItem {
  id: string;
  label: string;
  href: string;
  icon: Icon;
  badge?: string;
}

/** A secondary rail item below the divider (link or action). */
export interface AppShellAdditionalItem {
  id: string;
  label: string;
  icon: Icon;
  href?: string;
  onClick?: () => void;
  badge?: string;
}

export interface AppShellBrand {
  icon: Icon;
  href?: string;
  label?: string;
}

export interface AppShellAiButton {
  href?: string;
  icon?: Icon;
  label?: string;
  onClick?: () => void;
  hidden?: boolean;
}

export interface AppShellSettingsButton {
  href?: string;
  icon?: Icon;
  label?: string;
  onClick?: () => void;
  hidden?: boolean;
}

export interface AppShellNotifications {
  href?: string;
  onClick?: () => void;
  /** Unread count — a dot shows when > 0. */
  count?: number;
  hidden?: boolean;
}

export interface AppShellUserMenuItem {
  id: string;
  label: string;
  icon?: Icon;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}

export interface AppShellUser {
  name: string;
  email?: string;
  avatarUrl?: string;
  menuItems?: AppShellUserMenuItem[];
}

/**
 * The static shape of the shell. Runtime navigation wiring (`onNavigate`,
 * `linkComponent`) is injected by `LayoutAppShell` from the Next router — the
 * placeholder config in `nav.config.tsx` supplies everything else.
 */
export interface AppShellConfig {
  brand: AppShellBrand;
  nav: AppShellNavItem[];
  additional?: AppShellAdditionalItem[];
  aiButton?: AppShellAiButton;
  settingsButton?: AppShellSettingsButton;
  notifications?: AppShellNotifications;
  user?: AppShellUser;
  /** Anchor component for rail links (e.g. Next `Link`). Defaults to `"a"`. */
  linkComponent?: ElementType;
  /** Programmatic navigation for spotlight/bookmark items fired via onClick. */
  onNavigate?: (href: string) => void;
}
