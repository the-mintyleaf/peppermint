"use client";

import type { MouseEvent } from "react";
import { Box, Tooltip, UnstyledButton } from "@peppermint/ui";
import type { BoxProps } from "@peppermint/ui";
import type { Icon } from "@phosphor-icons/react";
import { MAIN_NAV_WIDTH } from "../AdminShell.Navbar";

type MainNavIconButtonProps = {
  icon: Icon;
  label: string;
  href?: string;
  onClick?: (event: MouseEvent) => void;
  active?: boolean;
  iconColor?: string;
  iconWeight?: "fill" | "regular" | "bold" | "thin" | "light" | "duotone";
} & Pick<
  BoxProps,
  "m" | "mx" | "my" | "mt" | "mb" | "p" | "px" | "py" | "pt" | "pb"
>;

export function MainNavIconButton({
  icon: IconComponent,
  label,
  href,
  onClick,
  active = false,
  iconColor,
  iconWeight,
  ...boxProps
}: MainNavIconButtonProps) {
  return (
    <Box {...boxProps}>
      <Tooltip label={label} position="right" withArrow>
        <UnstyledButton
          component={href ? "a" : "button"}
          href={href}
          onClick={(event: MouseEvent) => onClick?.(event)}
          aria-label={label}

          style={{
            borderRadius: "var(--mantine-radius-default)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: MAIN_NAV_WIDTH - 16,
            height: 32,
           
            color:
              iconColor ??
              (active
                ? "var(--mantine-color-gray-0)"
                : "var(--mantine-color-dark-2)"),
            transition: "background-color 150ms ease, color 150ms ease",
          }}
        >
          <IconComponent
            size={16}
            weight={iconWeight ?? (active ? "fill" : "duotone")}
          />
        </UnstyledButton>
      </Tooltip>
    </Box>
  );
}
