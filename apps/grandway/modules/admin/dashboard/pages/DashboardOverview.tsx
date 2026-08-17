"use client";

import { ModuleErrorBoundary } from "@peppermint/admin";
import {
  Grid,
  ModalPaper,
  ModuleHeader,
  Stack,
  Text,
  useQueryClient,
} from "@peppermint/ui";
import { useCapabilities } from "@/config/access";
import { useDashboardFilters, useDashboardSummary } from "../dashboard.hooks";
import { ActivityPanel } from "../components/ActivityPanel";
import { ApplicantCountryStats } from "../components/ApplicantCountryStats";
import { ApplicantStatTiles } from "../components/ApplicantStatTiles";
import { AttentionPanel } from "../components/AttentionPanel";
import { BlockersPanel } from "../components/BlockersPanel";
import { DashboardGreeting } from "../components/DashboardGreeting";
import { DashboardHeaderControls } from "../components/DashboardHeaderControls";
import { LeadStatTiles } from "../components/LeadStatTiles";
import { LeadStats } from "../components/LeadStats";
import { LeadsToAddress } from "../components/LeadsToAddress";
import { PerformancePanel } from "../components/PerformancePanel";
import { PipelinePanel } from "../components/PipelinePanel";
import { RecentApplicants } from "../components/RecentApplicants";
import { RemindersPanel } from "../components/RemindersPanel";
import { SectionBand } from "../components/SectionBand";
import { TodayPanel } from "../components/TodayPanel";
import { WorkloadPanel } from "../components/WorkloadPanel";

/**
 * Every card measures against the same twelve columns: a large card is half the
 * page, a stat card a sixth, and the tile column a sixth of that half — so a
 * card's width tells you what kind of thing it is before you read it.
 */
const LARGE = { base: 12, lg: 6 } as const;
const MEDIUM = { base: 12, sm: 8, lg: 4 } as const;
const SMALL = { base: 12, sm: 4, lg: 2 } as const;

/**
 * The operational command centre, read top to bottom.
 *
 * The page opens on the operator by name, then goes straight to work in the
 * order the work decays: leads rot fastest, so they lead; the people those leads
 * became come second; everything that is a standing measure rather than a thing
 * to do today sits below both. There are no tabs — the reading order is the
 * page's, not a choice the operator has to make before they can see anything
 * (§1.6: an always-visible option is paid for on every visit, by everyone).
 *
 * Each of the first two bands pairs a LEFT column of figures with a RIGHT card
 * of rows: the figures say how much, the rows are where you act.
 *
 * The eight contract sections are still independent — one request each, one
 * `ModuleErrorBoundary` per band, so a slow or failing section never blocks the
 * rest of the page (CONCEPT.md). A card with several views fetches only the open
 * one, which is what the old tab bar bought and is kept here without it.
 *
 * **Follow-ups is a ninth section that is not part of the dashboard contract at
 * all** — `/api/v1/dashboard/` has no reminder data, so that card reads
 * `/api/v1/reminders/` directly. It carries the same no-cross-section-
 * consistency caveat as the other eight, and it sits outside the Operations
 * gate on purpose (see the comment at its band).
 */
export function DashboardOverview() {
  const filters = useDashboardFilters();
  // Staff get the two bands that ARE the work — the leads waiting on them and the
  // applicants those became. Operations is standing measurement (queues, conversion
  // rates, cross-team workload), which is an Admin's view of the office, not a
  // caseworker's view of their day.
  const { dashboardOperations, reminders: canUseReminders } = useCapabilities();
  const queryClient = useQueryClient();
  // `summary` only for its fetch time — `AttentionPanel` reads the same cached entry.
  const { dataUpdatedAt } = useDashboardSummary(filters);
  const resetKeys = [filters.fiscalYear, filters.country];

  return (
    <>
      <ModuleHeader breadcrumbItems={[{ label: "Home", href: "/admin" }]} />

      {/* `ModalPaper` is a fixed-height box with `overflow: hidden` — a report
          page has no internal scroll of its own, so it would be clipped.
          Override to scroll vertically inside the paper. */}
      <ModalPaper withBorder style={{ overflowY: "auto" }}>
        <Stack gap="xl" p="md">
          <DashboardGreeting
            controls={
              <DashboardHeaderControls
                fiscalYear={filters.fiscalYear}
                country={filters.country}
                fetchedAt={dataUpdatedAt}
                onFiscalYearChange={filters.setFiscalYear}
                onCountryChange={filters.setCountry}
                onRefresh={() =>
                  queryClient.invalidateQueries({ queryKey: ["dashboard"] })
                }
              />
            }
          />

          <ModuleErrorBoundary resetKeys={resetKeys}>
            <SectionBand
              title="Leads"
              subtitle="Who is waiting to hear from us, and how the live pipeline is shaped."
            >
              <Grid.Col span={MEDIUM}>
                <LeadStats filters={filters} />
              </Grid.Col>
              <Grid.Col span={SMALL}>
                <LeadStatTiles filters={filters} />
              </Grid.Col>
              <Grid.Col span={LARGE}>
                <LeadsToAddress filters={filters} />
              </Grid.Col>
            </SectionBand>
          </ModuleErrorBoundary>

          <ModuleErrorBoundary resetKeys={resetKeys}>
            <SectionBand
              title="Applicants"
              subtitle="Where the book of work is going, and who has just joined it."
            >
              <Grid.Col span={MEDIUM}>
                <ApplicantCountryStats filters={filters} />
              </Grid.Col>
              <Grid.Col span={SMALL}>
                <ApplicantStatTiles filters={filters} />
              </Grid.Col>
              <Grid.Col span={LARGE}>
                <RecentApplicants filters={filters} />
              </Grid.Col>
            </SectionBand>
          </ModuleErrorBoundary>

          {/* **Outside the Operations gate, deliberately.** A `custom_reminder`
              alert is routed to Admins only, so a Lead Manager's own follow-ups
              surface nowhere automatically — the reminders contract's §9 names
              this query as the client-side answer. Folding this card into the
              Admin-only band would hide it from exactly the people with no
              other way to see their due work.

              No `resetKeys` on this boundary: unlike every other band, nothing
              here reads the fiscal-year or country filters, so there is nothing
              for a filter change to reset. */}
          {canUseReminders && (
            <ModuleErrorBoundary>
              <SectionBand
                title="Follow-ups"
                subtitle="Dated notes staff set on a record — and which of them have come due."
              >
                <Grid.Col span={LARGE}>
                  <RemindersPanel />
                </Grid.Col>
              </SectionBand>
            </ModuleErrorBoundary>
          )}

          {dashboardOperations && (
            <ModuleErrorBoundary resetKeys={resetKeys}>
              <SectionBand
                title="Operations"
                subtitle="The queues, the standing measures, and what just changed."
              >
                <Grid.Col span={LARGE}>
                  <AttentionPanel filters={filters} />
                </Grid.Col>
                <Grid.Col span={LARGE}>
                  <TodayPanel filters={filters} />
                </Grid.Col>
                <Grid.Col span={LARGE}>
                  <BlockersPanel filters={filters} />
                </Grid.Col>
                <Grid.Col span={LARGE}>
                  <WorkloadPanel filters={filters} />
                </Grid.Col>
                <Grid.Col span={LARGE}>
                  <PipelinePanel filters={filters} />
                </Grid.Col>
                <Grid.Col span={LARGE}>
                  <PerformancePanel filters={filters} />
                </Grid.Col>
                <Grid.Col span={LARGE}>
                  <ActivityPanel
                    key={filters.fiscalYear}
                    fiscalYear={filters.fiscalYear}
                  />
                </Grid.Col>
              </SectionBand>
            </ModuleErrorBoundary>
          )}

          <Text size="xs" c="dimmed" ff="monospace">
            {dashboardOperations
              ? "Access: admin · lead_manager."
              : "Access: lead_manager — the Operations band is admin-only."}{" "}
            Fiscal year and destination country (top right) scope every card
            except Recent activity, which is fiscal-year only, and Follow-ups,
            which reads neither. Overdue and expiry flags are computed
            server-side, except on Follow-ups, where the due day is a Nepal
            calendar day resolved in the browser. Figures come from different
            endpoints and different windows — read each card on its own terms,
            never across them.
          </Text>
        </Stack>
      </ModalPaper>
    </>
  );
}
