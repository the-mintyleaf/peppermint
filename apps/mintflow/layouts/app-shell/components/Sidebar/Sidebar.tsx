"use client";

import { Box, ScrollArea, Stack, Text } from "@peppermint/ui";

import { resolveActiveHref } from "../../nav.utils";
import { NAV_WIDTH, navCardStyle } from "../../shell.constants";
import {
  NavRow,
  NavSpotlight,
  SearchField,
  SidebarBrand,
  SidebarFooter,
} from "./components";
import type { SidebarProps } from "./Sidebar.types";
import classes from "./Sidebar.module.css";

/**
 * The full always-open navigation panel: brand → search → titled groups
 * (Menu, Work Files, …) of labeled rows → footer cluster.
 */
export function Sidebar({ config, pathname }: SidebarProps) {
  const activeHref = resolveActiveHref(config.groups, pathname);

  return (
    <Stack
      gap={0}
      h="100%"
      w={NAV_WIDTH}
      style={{ flexShrink: 0, ...navCardStyle }}
    >
      <Box p="sm" pb={6}>
        <SidebarBrand
          icon={config.brand.icon}
          label={config.brand.label}
          caption={config.brand.caption}
          href={config.brand.href}
          linkComponent={config.linkComponent}
        />
      </Box>

      <Box px="sm" pb="xs">
        <SearchField />
      </Box>

      <ScrollArea style={{ flex: 1 }} scrollbarSize={6} type="hover">
        <Stack gap="lg" px="sm" py="xs">
          {config.groups.map((group) => (
            <Stack key={group.id} gap={2}>
              <Text component="span" className={classes.sectionLabel}>
                {group.label}
              </Text>
              {group.items.map((item) => (
                <NavRow
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  badge={item.badge}
                  active={activeHref === item.href}
                  linkComponent={config.linkComponent}
                />
              ))}
            </Stack>
          ))}
        </Stack>
      </ScrollArea>

      <Box p="sm" pt={6}>
        <SidebarFooter
          aiButton={config.aiButton}
          settingsButton={config.settingsButton}
          notifications={config.notifications}
          user={config.user}
          pathname={pathname}
          linkComponent={config.linkComponent}
          onNavigate={config.onNavigate}
        />
      </Box>

      <NavSpotlight groups={config.groups} onNavigate={config.onNavigate} />
    </Stack>
  );
}
