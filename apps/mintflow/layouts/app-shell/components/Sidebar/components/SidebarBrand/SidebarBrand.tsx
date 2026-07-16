"use client";

import { Box, Stack, Text, UnstyledButton } from "@peppermint/ui";

import type { SidebarBrandProps } from "./SidebarBrand.types";
import classes from "./SidebarBrand.module.css";

/** Brand header for the nav panel — accent chip + wordmark + caption. */
export function SidebarBrand({
  icon: IconComponent,
  label = "kamban.",
  caption,
  href,
  linkComponent,
}: SidebarBrandProps) {
  // Cast narrows Mantine's polymorphic `component` from the broad `ElementType`.
  const Component = (href ? (linkComponent ?? "a") : "button") as "a";

  return (
    <UnstyledButton
      component={Component}
      href={href}
      aria-label={label}
      className={classes.brand}
    >
      <Box className={classes.chip}>
        <IconComponent size={20} weight="fill" />
      </Box>
      <Stack gap={0} className={classes.text}>
        <Text component="span" className={classes.word}>
          {label}
        </Text>
        {caption && (
          <Text component="span" className={classes.caption}>
            {caption}
          </Text>
        )}
      </Stack>
    </UnstyledButton>
  );
}
