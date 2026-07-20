import type { AppShellConfig } from "../../AppShell.types";

export interface SidebarProps {
  /** Fully-resolved config, including `onNavigate` / `linkComponent`. */
  config: AppShellConfig;
  pathname: string;
}
