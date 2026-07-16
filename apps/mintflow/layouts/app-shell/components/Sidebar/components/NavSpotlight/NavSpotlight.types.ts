import type {
  AppShellAdditionalItem,
  AppShellNavItem,
} from "../../../../AppShell.types";

export interface NavSpotlightProps {
  nav: AppShellNavItem[];
  additional?: AppShellAdditionalItem[];
  onNavigate?: (href: string) => void;
}
