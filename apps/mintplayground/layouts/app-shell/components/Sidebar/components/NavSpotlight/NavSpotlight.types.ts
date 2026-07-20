import type { AppShellNavGroup } from "../../../../AppShell.types";

export interface NavSpotlightProps {
  groups: AppShellNavGroup[];
  onNavigate?: (href: string) => void;
}
