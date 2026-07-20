import type { ElementType, MouseEvent } from "react";
import type { Icon } from "@phosphor-icons/react";

export interface NavRowProps {
  icon: Icon;
  label: string;
  href?: string;
  active?: boolean;
  /** Small count chip on the right (e.g. board card count). */
  badge?: string;
  linkComponent?: ElementType;
  onClick?: (event: MouseEvent) => void;
  /** Icon-only, centered rendering with a tooltip for the collapsed icon rail. */
  collapsed?: boolean;
}
