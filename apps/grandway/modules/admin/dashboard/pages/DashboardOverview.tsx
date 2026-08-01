"use client";

import type { ReactNode } from "react";
import { ModuleErrorBoundary } from "@peppermint/admin";
import {
  ModalPaper,
  ModuleHeader,
  Stack,
  Tabs,
  Text,
  useQueryClient,
} from "@peppermint/ui";
import { useDashboardFilters, useDashboardTab } from "../dashboard.hooks";
import { DASHBOARD_TAB_META, type DashboardTab } from "../dashboard.tabs";
import { ActivityFeed } from "../components/ActivityFeed";
import { Blockers } from "../components/Blockers";
import { Conversion } from "../components/Conversion";
import { DashboardHeaderControls } from "../components/DashboardHeaderControls";
import { DashboardHero } from "../components/DashboardHero";
import { DashboardTabs } from "../components/DashboardTabs";
import { Outcomes } from "../components/Outcomes";
import { OverviewPanel } from "../components/OverviewPanel";
import { PipelineCounts } from "../components/PipelineCounts";
import { SectionHeading } from "../components/SectionHeading";
import { TodayWorklists } from "../components/TodayWorklists";
import { Workload } from "../components/Workload";

/**
 * The operational command centre. The eight sections are unchanged and still
 * independent — one request each, one `ModuleErrorBoundary` each (CONCEPT.md
 * "every section loads independently, so a slow panel never blocks the rest of
 * the page") — but they are no longer stacked into one scroll. Overview answers
 * "is everything okay?" with exceptions and headline figures only; each detail
 * tab holds one section's full previews, tables and caveats.
 *
 * `keepMounted={false}` means only the open tab's queries run, so the reading
 * order is now a choice the operator makes rather than eight sections all
 * fetching on load. React Query caches by key, so an Overview card and its tab
 * share one request rather than issuing two.
 *
 * No cross-section consistency guarantee (INTEGRATION.md §3) and no refresh
 * contract (§9 "the client decides when to refetch") — "Refresh" invalidates
 * every `dashboard` query; nothing here polls, and the hero states when the
 * figures were fetched.
 */
export function DashboardOverview() {
  const filters = useDashboardFilters();
  const { tab, setTab } = useDashboardTab();
  const queryClient = useQueryClient();
  const resetKeys = [filters.fiscalYear, filters.country, tab];

  /** Every panel gets the same chrome: its question, its caveat, its own boundary. */
  const panel = (value: DashboardTab, children: ReactNode) => (
    <Tabs.Panel value={value} pt="lg">
      <Stack gap="md">
        <SectionHeading
          title={DASHBOARD_TAB_META[value].title}
          subtitle={DASHBOARD_TAB_META[value].subtitle}
        />
        <ModuleErrorBoundary resetKeys={resetKeys}>
          {children}
        </ModuleErrorBoundary>
      </Stack>
    </Tabs.Panel>
  );

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[{ label: "Home", href: "/admin" }]}
        right={
          <DashboardHeaderControls
            fiscalYear={filters.fiscalYear}
            country={filters.country}
            onFiscalYearChange={filters.setFiscalYear}
            onCountryChange={filters.setCountry}
            onRefresh={() =>
              queryClient.invalidateQueries({ queryKey: ["dashboard"] })
            }
          />
        }
      />

      {/* ModalPaper is a fixed-height (`calc(100% - header)`) box with
          `overflow: hidden` — list modules scroll inside their DataTableShell, but
          a report panel has no internal scroll, so it would be clipped. Override to
          scroll vertically inside the paper (horizontal stays clipped). */}
      <ModalPaper withBorder style={{ overflowY: "auto" }}>
        <Stack gap="lg" p="md">
          <DashboardHero filters={filters} />

          <DashboardTabs value={tab} onChange={setTab}>
            {panel(
              "overview",
              <OverviewPanel filters={filters} onOpenTab={setTab} />,
            )}
            {panel("today", <TodayWorklists filters={filters} />)}
            {panel("pipeline", <PipelineCounts filters={filters} />)}
            {panel("blockers", <Blockers filters={filters} />)}
            {panel("workload", <Workload filters={filters} />)}
            {panel(
              "performance",
              <Stack gap="lg">
                <Conversion filters={filters} />
                <Outcomes filters={filters} />
              </Stack>,
            )}
            {panel(
              "activity",
              <ActivityFeed
                key={filters.fiscalYear}
                fiscalYear={filters.fiscalYear}
              />,
            )}
          </DashboardTabs>

          <Text size="xs" c="dimmed" ff="monospace">
            Access: admin · lead_manager. Fiscal year and destination country
            (top right) scope every tab except Activity, which is fiscal-year
            only. Overdue and expiry flags are computed server-side.
          </Text>
        </Stack>
      </ModalPaper>
    </>
  );
}
