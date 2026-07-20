"use client";

import {
  ActionIcon,
  Box,
  Burger,
  Group,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
} from "@peppermint/ui";
import { MoonIcon } from "@phosphor-icons/react/dist/csr/Moon";
import { SunIcon } from "@phosphor-icons/react/dist/csr/Sun";

import { CrossMark, MonoText } from "@/components";
import type { TopRailProps } from "./TopRail.types";
import classes from "./TopRail.module.css";

/**
 * The frame's opening rail: brand on the left, a mono marker on the right, and
 * the drawer trigger below `sm` where the nav column has left the frame.
 *
 * The scheme toggle lives here rather than in the nav column because the whole
 * point of a token-only language is that it inverts — in a playground the toggle
 * needs to be one click away from every surface, not buried behind a collapse.
 */
export function TopRail({
  brand,
  linkComponent,
  meta,
  navOpened,
  onToggleNav,
  showNavTrigger = true,
}: TopRailProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const BrandIcon = brand.icon;
  // Cast narrows Mantine's polymorphic `component` from the broad `ElementType`.
  const Component = (brand.href ? (linkComponent ?? "a") : "div") as "a";

  const isDark = colorScheme === "dark";
  const schemeLabel = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Box component="header" className={classes.rail}>
      <CrossMark className={classes.junctionStart} />
      <CrossMark className={classes.junctionEnd} />

      <Group gap="sm" wrap="nowrap" miw={0}>
        {showNavTrigger && (
          <Burger
            opened={navOpened}
            onClick={onToggleNav}
            size="sm"
            hiddenFrom="sm"
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
        </UnstyledButton>
      </Group>

      <Group gap="xs" wrap="nowrap">
        <MonoText
          label
          fz="10px"
          fw={700}
          c="var(--ml-meta-ink)"
          className={classes.railMeta}
        >
          {meta}
        </MonoText>

        <Tooltip label={schemeLabel} withArrow>
          <ActionIcon
            variant="default"
            size="md"
            onClick={toggleColorScheme}
            aria-label={schemeLabel}
          >
            {isDark ? <SunIcon size={15} /> : <MoonIcon size={15} />}
          </ActionIcon>
        </Tooltip>
      </Group>
    </Box>
  );
}
