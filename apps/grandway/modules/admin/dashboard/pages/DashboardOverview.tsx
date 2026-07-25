"use client";

import { ModuleErrorBoundary } from "@peppermint/admin";
import {
  Button,
  Divider,
  ModalPaper,
  ModuleHeader,
  Stack,
  Text,
  useQueryClient,
} from "@peppermint/ui";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { useDashboardFilters } from "../dashboard.hooks";
import { ActivityFeed } from "../components/ActivityFeed";
import { Blockers } from "../components/Blockers";
import { Conversion } from "../components/Conversion";
import { DashboardFilterBar } from "../components/DashboardFilterBar";
import { Outcomes } from "../components/Outcomes";
import { PipelineCounts } from "../components/PipelineCounts";
import { SummaryStrip } from "../components/SummaryStrip";
import { TodayWorklists } from "../components/TodayWorklists";
import { Workload } from "../components/Workload";

/**
 * The operational command centre — eight independent sections, each its own
 * request (CONCEPT.md "every section loads independently, so a slow panel
 * never blocks the rest of the page"). Recommended reading order per
 * CONCEPT.md: alerts -> today -> pipeline -> blockers -> workload ->
 * conversion -> recent activity. Every section is wrapped in its own
 * `ModuleErrorBoundary` so one section's render error can't blank the page.
 *
 * No cross-section consistency guarantee (INTEGRATION.md §3) and no refresh
 * contract (§9 "the client decides when to refetch") — "Refresh all" below
 * simply invalidates every `dashboard` query; nothing here polls.
 */
function DashboardOverviewContent() {
  const filters = useDashboardFilters();
  const queryClient = useQueryClient();
  const resetKeys = [filters.fiscalYear, filters.country];

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Home", href: "/admin" },
          { label: "Dashboard", href: "/admin/dashboard" },
        ]}
        right={
          <Button
            size="xs"
            variant="default"
            leftSection={<ArrowClockwiseIcon size={14} aria-hidden />}
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["dashboard"] })
            }
          >
            Refresh all
          </Button>
        }
      />
      <ModalPaper withBorder>
        <Stack gap="lg" p="md">
          <Text size="xs" c="dimmed">
            Every figure is derived live at request time — there is no caching,
            so numbers reflect the moment each section last loaded. Use Refresh
            all to see the latest.
          </Text>

          <DashboardFilterBar
            fiscalYear={filters.fiscalYear}
            country={filters.country}
            onFiscalYearChange={filters.setFiscalYear}
            onCountryChange={filters.setCountry}
          />

          <Divider />

          <ModuleErrorBoundary resetKeys={resetKeys}>
            <SummaryStrip />
          </ModuleErrorBoundary>

          <Divider />

          <ModuleErrorBoundary resetKeys={resetKeys}>
            <TodayWorklists />
          </ModuleErrorBoundary>

          <Divider />

          <ModuleErrorBoundary resetKeys={resetKeys}>
            <PipelineCounts />
          </ModuleErrorBoundary>

          <Divider />

          <ModuleErrorBoundary resetKeys={resetKeys}>
            <Blockers />
          </ModuleErrorBoundary>

          <Divider />

          <ModuleErrorBoundary resetKeys={resetKeys}>
            <Workload />
          </ModuleErrorBoundary>

          <Divider />

          <ModuleErrorBoundary resetKeys={resetKeys}>
            <Conversion filters={filters} />
          </ModuleErrorBoundary>

          <Divider />

          <ModuleErrorBoundary resetKeys={resetKeys}>
            <Outcomes filters={filters} />
          </ModuleErrorBoundary>

          <Divider />

          <ModuleErrorBoundary resetKeys={resetKeys}>
            <ActivityFeed fiscalYear={filters.fiscalYear} />
          </ModuleErrorBoundary>
        </Stack>
      </ModalPaper>
    </>
  );
}

/**
 * `RequireLeadAccess` already restricts to `admin`/`lead_manager` and refuses
 * `superadmin` (its own gate logic, `RequireLeadAccess.tsx`) — the exact rule
 * INTEGRATION.md §1 needs (`DASHBOARDS_ACTOR_FORBIDDEN` for every Superadmin
 * call). No additional authority check is needed here.
 */
export function ModuleDashboardOverview() {
  return (
    <RequireLeadAccess>
      <DashboardOverviewContent />
    </RequireLeadAccess>
  );
}
