"use client";

import { ModuleErrorBoundary } from "@peppermint/admin";
import {
  ModalPaper,
  ModuleHeader,
  Stack,
  Text,
  useQueryClient,
} from "@peppermint/ui";
import { useDashboardFilters } from "../dashboard.hooks";
import { ActivityFeed } from "../components/ActivityFeed";
import { Blockers } from "../components/Blockers";
import { Conversion } from "../components/Conversion";
import { DashboardHeaderControls } from "../components/DashboardHeaderControls";
import { DashboardHero } from "../components/DashboardHero";
import { Outcomes } from "../components/Outcomes";
import { PipelineCounts } from "../components/PipelineCounts";
import { SectionHeading } from "../components/SectionHeading";
import { SummaryStrip } from "../components/SummaryStrip";
import { TodayWorklists } from "../components/TodayWorklists";
import { Workload } from "../components/Workload";

/**
 * The operational command centre — eight independent sections, each its own
 * request (CONCEPT.md "every section loads independently, so a slow panel never
 * blocks the rest of the page"). Reading order per CONCEPT.md: alerts → today →
 * pipeline → blockers → workload → conversion → outcomes → recent activity. Each
 * section owns its `ModuleErrorBoundary` so one section's render error can't blank
 * the page; the section heading + "how to read this" caption is lifted out of the
 * section into `SectionHeading` so the section renders only its card(s).
 *
 * No cross-section consistency guarantee (INTEGRATION.md §3) and no refresh
 * contract (§9 "the client decides when to refetch") — "Refresh all" simply
 * invalidates every `dashboard` query; nothing here polls.
 */
export function DashboardOverview() {
  const filters = useDashboardFilters();
  const queryClient = useQueryClient();
  const resetKeys = [filters.fiscalYear, filters.country];

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

      <ModalPaper withBorder>
        <Stack gap="lg" p="md">
          <DashboardHero />

          <Text size="xs" c="dimmed">
            Fiscal year and destination country (top right) scope the sections
            below. There is no refresh contract — figures reflect the moment
            each section was last fetched; use Refresh to pull the latest.
          </Text>

          <Stack gap="xl">
            <ModuleErrorBoundary resetKeys={resetKeys}>
              <SummaryStrip filters={filters} />
            </ModuleErrorBoundary>

            <Stack gap="md">
              <SectionHeading
                id="today-worklists"
                title="Today's worklists"
                subtitle="Six queues — each preview is capped at 10 rows."
              />
              <ModuleErrorBoundary resetKeys={resetKeys}>
                <TodayWorklists filters={filters} />
              </ModuleErrorBoundary>
            </Stack>

            <Stack gap="md">
              <SectionHeading
                title="Pipeline"
                subtitle="Zero-filled counts — every status is always shown, windowed on creation date."
              />
              <ModuleErrorBoundary resetKeys={resetKeys}>
                <PipelineCounts filters={filters} />
              </ModuleErrorBoundary>
            </Stack>

            <Stack gap="md">
              <SectionHeading
                id="blockers"
                title="Blockers"
                subtitle="Five groups where work is stuck — an empty group is the healthy state."
              />
              <ModuleErrorBoundary resetKeys={resetKeys}>
                <Blockers filters={filters} />
              </ModuleErrorBoundary>
            </Stack>

            <Stack gap="md">
              <SectionHeading
                title="Workload by owner"
                subtitle="Three independent measures — never joined or summed."
              />
              <ModuleErrorBoundary resetKeys={resetKeys}>
                <Workload filters={filters} />
              </ModuleErrorBoundary>
            </Stack>

            <Stack gap="md">
              <SectionHeading
                title="Conversion"
                subtitle="Four independent rates — the percent is blank when the denominator is 0."
              />
              <ModuleErrorBoundary resetKeys={resetKeys}>
                <Conversion filters={filters} />
              </ModuleErrorBoundary>
            </Stack>

            <Stack gap="md">
              <SectionHeading
                title="Outcomes"
                subtitle="Two different time windows — do not sum across them."
              />
              <ModuleErrorBoundary resetKeys={resetKeys}>
                <Outcomes filters={filters} />
              </ModuleErrorBoundary>
            </Stack>

            <Stack gap="md">
              <SectionHeading
                title="Activity"
                subtitle="Fiscal-year scope only — the destination country filter does not apply."
              />
              <ModuleErrorBoundary resetKeys={resetKeys}>
                <ActivityFeed
                  key={filters.fiscalYear}
                  fiscalYear={filters.fiscalYear}
                />
              </ModuleErrorBoundary>
            </Stack>
          </Stack>

          <Text size="xs" c="dimmed" ff="monospace">
            Access: admin · lead_manager. Sections are isolated by
            ModuleErrorBoundary + SectionState; overdue and expiry flags are
            computed server-side.
          </Text>
        </Stack>
      </ModalPaper>
    </>
  );
}
