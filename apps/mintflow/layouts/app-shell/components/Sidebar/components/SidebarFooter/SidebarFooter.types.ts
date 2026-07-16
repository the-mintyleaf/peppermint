import type { ElementType } from "react";
import type {
  AppShellAiButton,
  AppShellNotifications,
  AppShellSettingsButton,
  AppShellUser,
} from "../../../../AppShell.types";

export interface SidebarFooterProps {
  aiButton?: AppShellAiButton;
  settingsButton?: AppShellSettingsButton;
  notifications?: AppShellNotifications;
  user?: AppShellUser;
  pathname: string;
  linkComponent?: ElementType;
  onNavigate?: (href: string) => void;
}
