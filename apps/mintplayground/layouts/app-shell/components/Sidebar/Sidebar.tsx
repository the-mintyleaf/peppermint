"use client";

import { Box, Group, ScrollArea, Stack, Text } from "@peppermint/ui";

import { useSidebarStore } from "../../AppShell.store";
import { useRailCollapsed } from "../../AppShell.hooks";
import { resolveActiveHref } from "../../nav.utils";
import {
  NAV_WIDTH,
  NAV_WIDTH_COLLAPSED,
  navCardStyle,
} from "../../shell.constants";
import {
  NavRow,
  NavSpotlight,
  SearchField,
  SidebarBrand,
  SidebarFooter,
  SidebarToggle,
} from "./components";
import type { SidebarProps } from "./Sidebar.types";
import classes from "./Sidebar.module.css";

/**
 * The navigation panel: brand → search → titled groups (Menu, Work Files, …) of
 * labeled rows → footer cluster. Collapses to a narrow icon rail on desktop —
 * the collapse trigger sits at the top-right of the brand header when expanded
 * and moves above search when collapsed.
 */
export function Sidebar({ config, pathname }: SidebarProps) {
  const activeHref = resolveActiveHref(config.groups, pathname);
  const toggle = useSidebarStore((s) => s.toggle);
  // Desktop-only, hydration-gated — see useRailCollapsed.
  const isCollapsed = useRailCollapsed();

  return (
    <Stack
      gap={0}
      h="100%"
      w={isCollapsed ? NAV_WIDTH_COLLAPSED : NAV_WIDTH}
      className={classes.panel}
      style={{ flexShrink: 0, ...navCardStyle }}
    >
      <Box p="sm" pb={6}>
        {isCollapsed ? (
          <SidebarBrand
            icon={config.brand.icon}
            label={config.brand.label}
            caption={config.brand.caption}
            href={config.brand.href}
            linkComponent={config.linkComponent}
            collapsed
          />
        ) : (
          <Group gap={4} wrap="nowrap" align="center">
            <Box flex={1} miw={0}>
              <SidebarBrand
                icon={config.brand.icon}
                label={config.brand.label}
                caption={config.brand.caption}
                href={config.brand.href}
                linkComponent={config.linkComponent}
              />
            </Box>
            <SidebarToggle collapsed={false} onToggle={toggle} />
          </Group>
        )}
      </Box>

      {isCollapsed && (
        <Box px="sm" pb={6} className={classes.toggleRow}>
          <SidebarToggle collapsed onToggle={toggle} />
        </Box>
      )}

      <Box px="sm" pb="xs">
        <SearchField collapsed={isCollapsed} />
      </Box>

      <ScrollArea style={{ flex: 1 }} scrollbarSize={6} type="hover">
        <Stack gap="lg" px="sm" py="xs">
          {config.groups.map((group) => (
            <Stack key={group.id} gap={2}>
              {!isCollapsed && (
                <Text component="span" className={classes.sectionLabel}>
                  {group.label}
                </Text>
              )}
              {group.items.map((item) => (
                <NavRow
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  badge={item.badge}
                  active={activeHref === item.href}
                  linkComponent={config.linkComponent}
                  collapsed={isCollapsed}
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
          collapsed={isCollapsed}
        />
      </Box>

      <NavSpotlight groups={config.groups} onNavigate={config.onNavigate} />
    </Stack>
  );
}
