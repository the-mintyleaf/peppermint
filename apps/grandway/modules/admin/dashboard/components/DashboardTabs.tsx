"use client";

import type { ComponentType } from "react";
import { Box, ScrollArea, Tabs } from "@peppermint/ui";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/csr/SquaresFour";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
import { FlowArrowIcon } from "@phosphor-icons/react/dist/csr/FlowArrow";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import {
  DASHBOARD_TAB_META,
  DASHBOARD_TAB_VALUES,
  isDashboardTab,
  type DashboardTab,
} from "../dashboard.tabs";
import type { DashboardTabsProps } from "./DashboardTabs.types";

// One icon per concept, matching the glyph each area already wears elsewhere in
// the admin (checklists = ListChecks, blockers = Warning, people = UsersThree).
const TAB_ICONS: Record<DashboardTab, ComponentType<{ size?: number }>> = {
  overview: SquaresFourIcon,
  today: ListChecksIcon,
  pipeline: FlowArrowIcon,
  blockers: WarningIcon,
  workload: UsersThreeIcon,
  performance: TrendUpIcon,
  activity: ClockCounterClockwiseIcon,
};

/**
 * The dashboard's primary navigation. Only the active panel is mounted
 * (`keepMounted={false}` on the owning `Tabs`), so the eight independent section
 * queries fire when their tab is opened rather than all at once on load — the
 * "one slow section never blocks another" rule still holds, and the landing view
 * only pays for what it shows.
 *
 * The tabs carry NO count badge. Every number this page shows is defined by its
 * own window and label, and the contract forbids summing across sections
 * (INTEGRATION.md §7) — a bare digit on "Today" or "Blockers" would be an
 * unlabelled aggregate of things that are not addable. The counts live one click
 * away, next to the words that make them true.
 */
export function DashboardTabs({
  value,
  onChange,
  children,
}: DashboardTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(next) => {
        if (isDashboardTab(next)) onChange(next);
      }}
      keepMounted={false}
      variant="default"
    >
      {/* The paper scrolls, not the window, so the bar sticks to the top of the
          scroll container and the operator can switch section from anywhere in a
          long panel. `ScrollArea` keeps the seven tabs reachable on a narrow
          viewport instead of wrapping them onto two rows. */}
      <Box
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          background: "var(--mantine-color-body)",
        }}
      >
        <ScrollArea type="never">
          <Tabs.List
            aria-label="Dashboard sections"
            style={{ flexWrap: "nowrap" }}
          >
            {DASHBOARD_TAB_VALUES.map((tab) => {
              const Icon = TAB_ICONS[tab];
              return (
                <Tabs.Tab
                  key={tab}
                  value={tab}
                  leftSection={<Icon size={16} />}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {DASHBOARD_TAB_META[tab].label}
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
        </ScrollArea>
      </Box>

      {children}
    </Tabs>
  );
}
