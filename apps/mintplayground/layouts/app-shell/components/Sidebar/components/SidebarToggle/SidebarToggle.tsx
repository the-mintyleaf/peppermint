"use client";

import { ActionIcon, Tooltip } from "@peppermint/ui";
import { CaretDoubleLeftIcon } from "@phosphor-icons/react/dist/csr/CaretDoubleLeft";
import { CaretDoubleRightIcon } from "@phosphor-icons/react/dist/csr/CaretDoubleRight";

import type { SidebarToggleProps } from "./SidebarToggle.types";
import classes from "./SidebarToggle.module.css";

/**
 * Collapse / expand control for the desktop nav panel. Sits at the top-right of
 * the brand header when expanded, and as a standalone row above search when
 * collapsed.
 */
export function SidebarToggle({ collapsed, onToggle }: SidebarToggleProps) {
  const label = collapsed ? "Expand sidebar" : "Collapse sidebar";
  const Icon = collapsed ? CaretDoubleRightIcon : CaretDoubleLeftIcon;

  return (
    <Tooltip label={label} withArrow position={collapsed ? "right" : "bottom"}>
      <ActionIcon
        variant="transparent"
        size="md"
        className={classes.button}
        onClick={onToggle}
        aria-label={label}
        aria-expanded={!collapsed}
      >
        <Icon size={16} />
      </ActionIcon>
    </Tooltip>
  );
}
