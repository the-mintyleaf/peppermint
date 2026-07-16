"use client";

import { Indicator, Tooltip, UnstyledButton } from "@peppermint/ui";

import type { NavIconButtonProps } from "./NavIconButton.types";
import classes from "./NavIconButton.module.css";

/**
 * A single rail destination — dark-rail idle icon, accent-tinted active pill.
 * Renders as an anchor (via `linkComponent`) when `href` is set, else a button.
 */
export function NavIconButton({
  icon: IconComponent,
  label,
  href,
  active = false,
  badge,
  linkComponent,
  onClick,
}: NavIconButtonProps) {
  // Mantine's polymorphic `component` prop breaks type inference when given a
  // variable of the broad `ElementType`; the cast mirrors the admin shell.
  const Component = (href ? (linkComponent ?? "a") : "button") as "a";

  const button = (
    <UnstyledButton
      component={Component}
      href={href}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      data-active={active || undefined}
      className={classes.button}
    >
      <IconComponent size={18} weight={active ? "fill" : "regular"} />
    </UnstyledButton>
  );

  return (
    <Tooltip label={label} position="right" withArrow>
      {badge ? (
        <Indicator inline size={14} offset={4} label={badge} color="accent">
          {button}
        </Indicator>
      ) : (
        button
      )}
    </Tooltip>
  );
}
