"use client";

import type { MouseEvent } from "react";
import { Tooltip, UnstyledButton } from "@zetsel/ui";
import type { Icon } from "@phosphor-icons/react";

interface MainNavIconButtonProps {
  icon: Icon;
  label: string;
  href?: string;
  onClick?: (event: MouseEvent) => void;
  active?: boolean;
}

export function MainNavIconButton({
  icon: IconComponent,
  label,
  href,
  onClick,
  active = false,
}: MainNavIconButtonProps) {
  const button = (
    <UnstyledButton
      component={href ? "a" : "button"}
      href={href}
      onClick={(event: MouseEvent) => onClick?.(event)}
      aria-label={label}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: "var(--mantine-radius-md)",
        backgroundColor: active
          ? "var(--mantine-color-gray-8)"
          : "transparent",
        color: active
          ? "var(--mantine-color-gray-0)"
          : "var(--mantine-color-gray-5)",
        transition: "background-color 150ms ease, color 150ms ease",
      }}
    >
      <IconComponent size={16} weight={active ? "fill" : "duotone"} />
    </UnstyledButton>
  );

  return (
    <Tooltip label={label} position="right" withArrow>
      {button}
    </Tooltip>
  );
}
