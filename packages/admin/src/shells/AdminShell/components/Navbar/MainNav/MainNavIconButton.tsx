"use client";

import type { ElementType, MouseEvent } from "react";
import { Box, Indicator, Tooltip, UnstyledButton } from "@peppermint/ui";
import type { BoxProps } from "@peppermint/ui";
import type { Icon } from "@phosphor-icons/react";
import { MAIN_NAV_WIDTH } from "../AdminShell.Navbar";
import styles from "./MainNavIconButton.module.css";

type MainNavIconButtonProps = {
  icon: Icon;
  label: string;
  href?: string;
  linkComponent?: ElementType;
  onClick?: (event: MouseEvent) => void;
  active?: boolean;
  iconColor?: string;
  iconWeight?: "fill" | "regular" | "bold" | "thin" | "light" | "duotone";
  /** Small count/label shown as a Mantine `Indicator` on the icon's corner — e.g. an unread count. */
  badge?: string;
} & Pick<
  BoxProps,
  "m" | "mx" | "my" | "mt" | "mb" | "p" | "px" | "py" | "pt" | "pb"
>;

export function MainNavIconButton({
  icon: IconComponent,
  label,
  href,
  linkComponent,
  onClick,
  active = false,
  iconColor,
  iconWeight,
  badge,
  ...boxProps
}: MainNavIconButtonProps) {
  return (
    <Box {...boxProps}>
      <Tooltip label={label} position="right" withArrow>
        <UnstyledButton
          // `as any`: UnstyledButton's polymorphic `component` prop can't infer a
          // runtime-chosen element type (Link | "a" | "button"); same cast as SubNavLinks.
          component={(href ? (linkComponent ?? "a") : "button") as any}
          href={href}
          onClick={(event: MouseEvent) => onClick?.(event)}
          aria-label={badge ? `${label} (${badge})` : label}
          className={`${styles.iconButton} ${active ? styles.active : ""}`}
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
          <Indicator
            disabled={!badge}
            label={badge}
            size={16}
            offset={4}
            color="red"
          >
            <IconComponent
              size={16}
              weight={iconWeight ?? (active ? "fill" : "bold")}
            />
          </Indicator>
        </UnstyledButton>
      </Tooltip>
    </Box>
  );
}
