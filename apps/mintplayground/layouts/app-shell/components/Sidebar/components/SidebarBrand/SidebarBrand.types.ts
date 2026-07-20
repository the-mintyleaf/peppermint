import type { ElementType } from "react";
import type { Icon } from "@phosphor-icons/react";

export interface SidebarBrandProps {
  icon: Icon;
  label?: string;
  caption?: string;
  href?: string;
  linkComponent?: ElementType;
  /** Chip-only, centered rendering for the collapsed icon rail. */
  collapsed?: boolean;
}
