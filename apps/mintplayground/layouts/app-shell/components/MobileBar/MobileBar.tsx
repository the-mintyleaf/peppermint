"use client";

import { Box, Burger, Group, Text, UnstyledButton } from "@peppermint/ui";

import { CrossMark } from "@/components";
import type { MobileBarProps } from "./MobileBar.types";
import classes from "./MobileBar.module.css";

/**
 * The frame's opening bar below `sm`, where the nav column has left the frame
 * for a drawer. It carries the drawer trigger and a compact brand mark; from
 * `sm` up it is `display: none`, since the nav column returns to the frame and
 * carries the brand at its own head.
 */
export function MobileBar({
  brand,
  linkComponent,
  navOpened,
  onToggleNav,
  showNavTrigger = true,
}: MobileBarProps) {
  const BrandIcon = brand.icon;
  // Cast narrows Mantine's polymorphic `component` from the broad `ElementType`.
  const Component = (brand.href ? (linkComponent ?? "a") : "div") as "a";

  return (
    <Box component="header" className={classes.bar}>
      <CrossMark className={classes.junctionStart} />
      <CrossMark className={classes.junctionEnd} />

      <Group gap="sm" wrap="nowrap" miw={0}>
        {showNavTrigger && (
          <Burger
            opened={navOpened}
            onClick={onToggleNav}
            size="sm"
            aria-label="Toggle navigation"
          />
        )}

        <UnstyledButton
          component={Component}
          href={brand.href}
          aria-label={brand.label}
          className={classes.brand}
        >
          <Box className={classes.mark}>
            <BrandIcon size={16} weight="fill" />
          </Box>
          {brand.label && (
            <Text component="span" className={classes.word}>
              {brand.label}
            </Text>
          )}
        </UnstyledButton>
      </Group>
    </Box>
  );
}
