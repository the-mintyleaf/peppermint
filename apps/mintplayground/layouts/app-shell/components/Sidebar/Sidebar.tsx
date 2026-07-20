"use client";

import { Box, ScrollArea, Stack, Text } from "@peppermint/ui";

import { CrossMark } from "@/components";
import { useSidebarStore } from "../../AppShell.store";
import {
  NavRow,
  SearchField,
  SidebarFooter,
  SidebarToggle,
} from "./components";
import type { SidebarProps } from "./Sidebar.types";
import classes from "./Sidebar.module.css";

/** The marks that close an interior (dotted) rule where it meets a structural one. */
function BlockJunctions({ framed }: { framed: boolean }) {
  return (
    <>
      {framed && <CrossMark className={classes.junctionStart} />}
      <CrossMark className={classes.junctionEnd} />
    </>
  );
}

/**
 * The nav column's contents: region label → search → titled groups of
 * destination rows → footer. Blocks are divided by dotted rules with a `+` at
 * each end, so the column reads as one subdivided region rather than as a stack
 * of cards.
 *
 * Collapse comes from the `collapsed` prop, not the store, so the drawer copy
 * can render expanded while the desktop column stays collapsed.
 */
export function Sidebar({
  config,
  pathname,
  activeHref,
  collapsed,
  collapsible = false,
  framed = true,
}: SidebarProps) {
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <Box component="nav" aria-label="Primary" className={classes.panel}>
      <Box className={classes.block}>
        <BlockJunctions framed={framed} />
        <Box className={collapsed ? classes.headerCollapsed : classes.header}>
          {!collapsed && (
            <Text component="span" className={classes.headerLabel}>
              Navigate
            </Text>
          )}
          {collapsible && (
            <SidebarToggle collapsed={collapsed} onToggle={toggle} />
          )}
        </Box>
      </Box>

      <Box className={classes.block}>
        <BlockJunctions framed={framed} />
        <SearchField collapsed={collapsed} />
      </Box>

      <ScrollArea className={classes.scroll} scrollbarSize={6} type="hover">
        {config.groups.map((group, index) => (
          <Box key={group.id}>
            {/* A rule BETWEEN groups only — a trailing one would land a few
                pixels above the footer's solid rule, and two parallel hairlines
                that close together read as a mistake. */}
            {index > 0 && <Box className={classes.groupRule} aria-hidden />}
            {collapsed ? (
              <Box className={classes.groupSpacer} aria-hidden />
            ) : (
              <Text component="span" className={classes.groupLabel}>
                {group.label}
              </Text>
            )}
            <Stack gap={0} pb={8}>
              {group.items.map((item) => (
                <NavRow
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  badge={item.badge}
                  active={activeHref === item.href}
                  linkComponent={config.linkComponent}
                  collapsed={collapsed}
                />
              ))}
            </Stack>
          </Box>
        ))}
      </ScrollArea>

      <Box className={classes.blockSolid}>
        {framed && <CrossMark className={classes.junctionTopStart} />}
        <CrossMark className={classes.junctionTopEnd} />
        <SidebarFooter
          aiButton={config.aiButton}
          settingsButton={config.settingsButton}
          notifications={config.notifications}
          user={config.user}
          pathname={pathname}
          linkComponent={config.linkComponent}
          onNavigate={config.onNavigate}
          collapsed={collapsed}
          framed={framed}
        />
      </Box>
    </Box>
  );
}
