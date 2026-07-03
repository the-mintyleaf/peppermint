import type { ElementType, ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import type { UserInfoPopoverProps } from "./components/Navbar/UserInfoPopover/UserInfoPopover.types";

export interface AdminShellNavItem {
  label: string;
  href: string;
  icon?: Icon;
  badge?: string;
}

export interface AdminShellNavGroup {
  label: string;
  headerWidget?: ReactNode;
  items: AdminShellNavItem[];
}

export interface AdminShellSubNav {
  groups: AdminShellNavGroup[];
  widget?: ReactNode;
  homeHref: string;
}

export interface AdminShellMainNavPage {
  kind: "page";
  id: string;
  icon: Icon;
  label: string;
  href: string;
}

export interface AdminShellMainNavModule {
  kind: "module";
  id: string;
  icon: Icon;
  label: string;
  subNav: AdminShellSubNav;
}

export type AdminShellMainNavItem =
  | AdminShellMainNavPage
  | AdminShellMainNavModule;

export interface AdminShellMainNavAdditional {
  id: string;
  icon: Icon;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
}

export interface AdminShellBrand {
  icon: Icon;
  href?: string;
}

export interface AdminShellAiButton {
  href?: string;
  icon?: Icon;
  label?: string;
  color?: string;
  onClick?: () => void;
  hidden?: boolean;
}

export interface AdminShellSettingsButton {
  href?: string;
  icon?: Icon;
  label?: string;
  onClick?: () => void;
  hidden?: boolean;
}

export interface AdminShellConfig {
  brand: AdminShellBrand;
  mainNav: AdminShellMainNavItem[];
  additional?: AdminShellMainNavAdditional[];
  aiButton?: AdminShellAiButton;
  settingsButton?: AdminShellSettingsButton;
  userMenu?: UserInfoPopoverProps;
  linkComponent?: ElementType;
}
