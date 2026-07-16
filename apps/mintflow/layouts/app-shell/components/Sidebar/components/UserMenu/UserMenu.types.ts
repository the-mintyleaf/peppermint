import type { ElementType } from "react";
import type { AppShellUser } from "../../../../AppShell.types";

export interface UserMenuProps {
  user: AppShellUser;
  linkComponent?: ElementType;
  onNavigate?: (href: string) => void;
}
