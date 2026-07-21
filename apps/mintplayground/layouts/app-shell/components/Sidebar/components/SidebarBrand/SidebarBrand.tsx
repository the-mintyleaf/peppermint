"use client";

import { Box, Stack, Text, UnstyledButton } from "@peppermint/ui";

import { MonoText } from "@/components";
import type { SidebarBrandProps } from "./SidebarBrand.types";
import classes from "./SidebarBrand.module.css";

/**
 * The brand at the head of the nav column: square accent mark, wordmark, mono
 * caption. Collapsed to the icon rail it drops the text and keeps the mark
 * alone. No chip radius, no glow — elevation is not part of this language.
 *
 * Lives here rather than in a top rail: the column already opens the frame, so
 * the brand belongs at its head. Below `sm`, where the column becomes a drawer,
 * the mobile bar carries a copy of the mark instead.
 */
export function SidebarBrand({
  brand,
  linkComponent,
  collapsed,
}: SidebarBrandProps) {
  const BrandIcon = brand.icon;
  // Cast narrows Mantine's polymorphic `component` from the broad `ElementType`.
  const Component = (brand.href ? (linkComponent ?? "a") : "div") as "a";

  return (
    <UnstyledButton
      component={Component}
      href={brand.href}
      aria-label={brand.label}
      className={collapsed ? classes.brandCollapsed : classes.brand}
    >
      <Box className={classes.mark}>
        <BrandIcon size={16} weight="fill" />
      </Box>
      {!collapsed && (
        <Stack gap={0} className={classes.brandText}>
          <Text component="span" className={classes.word}>
            {brand.label}
          </Text>
          {brand.caption && (
            <MonoText label fz="9px" fw={600} c="var(--ml-meta-ink)" lh={1.4}>
              {brand.caption}
            </MonoText>
          )}
        </Stack>
      )}
    </UnstyledButton>
  );
}
