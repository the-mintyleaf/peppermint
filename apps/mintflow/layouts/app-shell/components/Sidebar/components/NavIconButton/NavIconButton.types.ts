import type { ElementType, MouseEvent } from "react";
import type { Icon } from "@phosphor-icons/react";

export interface NavIconButtonProps {
  icon: Icon;
  label: string;
  href?: string;
  active?: boolean;
  /** Small count/label shown as an indicator dot. */
  badge?: string;
  linkComponent?: ElementType;
  onClick?: (event: MouseEvent) => void;
}
