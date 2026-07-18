import type { ElementType } from "react";
import type { Icon } from "@phosphor-icons/react";

/** A single labeled destination row. */
export interface AppShellNavItem {
  id: string;
  label: string;
  href: string;
  icon: Icon;
  badge?: string;
  /** Hide this row unless the signed-in account is staff/superuser. */
  requiresStaff?: boolean;
}

/** A titled section of the nav panel (e.g. "Menu", "Work Files"). */
export interface AppShellNavGroup {
  id: string;
  label: string;
  items: AppShellNavItem[];
  /** Hide the whole group unless the signed-in account is staff/superuser. */
  requiresStaff?: boolean;
}

export interface AppShellBrand {
  icon: Icon;
  /** Wordmark shown next to the brand chip. */
  label?: string;
  /** Small caption under the wordmark (e.g. workspace/role). */
  caption?: string;
  href?: string;
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
  groups: AppShellNavGroup[];
  aiButton?: AppShellAiButton;
  settingsButton?: AppShellSettingsButton;
  notifications?: AppShellNotifications;
  user?: AppShellUser;
  /** Anchor component for panel links (e.g. Next `Link`). Defaults to `"a"`. */
  linkComponent?: ElementType;
  /** Programmatic navigation for spotlight/menu items fired via onClick. */
  onNavigate?: (href: string) => void;
}
