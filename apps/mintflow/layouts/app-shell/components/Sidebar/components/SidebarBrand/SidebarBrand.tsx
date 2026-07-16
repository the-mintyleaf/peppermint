"use client";

import { Tooltip, UnstyledButton } from "@peppermint/ui";

import type { SidebarBrandProps } from "./SidebarBrand.types";
import classes from "./SidebarBrand.module.css";

/** The brand chip pinned at the top of the rail. */
export function SidebarBrand({
  icon: IconComponent,
  label = "Home",
  href,
  linkComponent,
}: SidebarBrandProps) {
  // Cast narrows Mantine's polymorphic `component` from the broad `ElementType`.
  const Component = (href ? (linkComponent ?? "a") : "button") as "a";

  return (
    <Tooltip label={label} position="right" withArrow>
      <UnstyledButton
        component={Component}
        href={href}
        aria-label={label}
        className={classes.brand}
      >
        <IconComponent size={22} weight="fill" />
      </UnstyledButton>
    </Tooltip>
  );
}
