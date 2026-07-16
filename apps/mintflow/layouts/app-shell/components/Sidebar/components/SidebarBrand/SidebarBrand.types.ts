import type { ElementType } from "react";
import type { Icon } from "@phosphor-icons/react";

export interface SidebarBrandProps {
  icon: Icon;
  label?: string;
  href?: string;
  linkComponent?: ElementType;
}
