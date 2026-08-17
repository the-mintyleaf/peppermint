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
import { applicantsQueryKeys } from "@/modules/admin/applicants/applicants.queryKeys";
import { dueRemindersKey } from "@/modules/admin/reminders/reminders.queryKeys";
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
/**
 * Every cache root the "Refresh all" control has to reach.
 *
 * `["dashboard"]` covers the eight contract sections. The other two are
 * cross-module reads that sit under their own roots — the Follow-ups band
 * (`reminders.due`) and the per-country applicant counts / recent applicants
 * (`applicants`) — and a prefix match will never find them from here.
 */
const REFRESH_KEYS = [
  ["dashboard"],
  dueRemindersKey(),
  applicantsQueryKeys.all,
] as const;

const LARGE = { base: 12, lg: 6 } as const;
const MEDIUM = { base: 12, sm: 8, lg: 4 } as const;
const SMALL = { base: 12, sm: 4, lg: 2 } as const;

/**
 * The operational command centre, read top to bottom.
 *
 * The page opens on the operator by name, then goes straight to work in the
 * order the work decays: leads rot fastest, so they lead; the people those leads
 * became — and the follow-ups owed against them — come second; everything that
 * is a standing measure rather than a thing to do today sits below both. There are no tabs — the reading order is the
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
 * consistency caveat as the other eight, and it sits in the **Applicants**
 * band on purpose (see the comment at the card).
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
                onRefresh={() => {
                  // The control is labelled "Refresh all", so it must reach
                  // every card — including the ones that read another module's
                  // endpoint and therefore live outside the `["dashboard"]`
                  // prefix. Missing one of these is silent: the band simply
                  // keeps its cached answer while everything around it moves.
                  REFRESH_KEYS.forEach((queryKey) => {
                    void queryClient.invalidateQueries({ queryKey });
                  });
                }}
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
              subtitle="Where the book of work is going, who has just joined it, and what we owe them."
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
              {/* Follow-ups lives HERE rather than in its own band or in
                  Operations, and the placement is load-bearing twice over.

                  It has to be somewhere a `lead_manager` can see: a
                  `custom_reminder` alert is routed to Admins only, so that
                  tier's own due work surfaces nowhere automatically, and the
                  reminders contract's §9 names this query as the client-side
                  answer. The Applicants band is one of the two bands they get.

                  And it belongs beside the people it concerns. A follow-up is
                  a debt against a record in this band — reading "who just
                  joined" next to "what we owe them" is one thought, not two. */}
              {canUseReminders && (
                <Grid.Col span={LARGE}>
                  <RemindersPanel />
                </Grid.Col>
              )}
            </SectionBand>
          </ModuleErrorBoundary>

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
            which reads neither and covers client reminders as well as applicant
            ones. Overdue and expiry flags are computed server-side, except on
            Follow-ups, where the due day is a Nepal calendar day resolved in
            the browser. Figures come from different endpoints and different
            windows — read each card on its own terms, never across them.
          </Text>
        </Stack>
      </ModalPaper>
    </>
  );
}
