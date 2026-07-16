"use client";

import { Badge, Text, UnstyledButton } from "@peppermint/ui";

import type { NavRowProps } from "./NavRow.types";
import classes from "./NavRow.module.css";

/**
 * A full-width labeled destination row (icon + text + optional count) for the
 * always-open nav panel. Anchor when `href` is set, else a button.
 */
export function NavRow({
  icon: IconComponent,
  label,
  href,
  active = false,
  badge,
  linkComponent,
  onClick,
}: NavRowProps) {
  // Cast narrows Mantine's polymorphic `component` from the broad `ElementType`.
  const Component = (href ? (linkComponent ?? "a") : "button") as "a";

  return (
    <UnstyledButton
      component={Component}
      href={href}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      data-active={active || undefined}
      className={classes.row}
    >
      <IconComponent
        size={18}
        weight={active ? "fill" : "regular"}
        className={classes.icon}
        color={active ? "var(--mantine-color-accent-4)" : undefined}
      />
      <Text component="span" className={classes.label}>
        {label}
      </Text>
      {badge && (
        <Badge
          size="xs"
          radius="sm"
          variant="light"
          color={active ? "accent" : "gray"}
        >
          {badge}
        </Badge>
      )}
    </UnstyledButton>
  );
}
