"use client";

import { Grid } from "@peppermint/ui";
import { useCapabilities } from "@/config/access";
import { ActivityPanel } from "./ActivityPanel";
import { ApplicantCountryStats } from "./ApplicantCountryStats";
import { ApplicantStatTiles } from "./ApplicantStatTiles";
import { BlockersPanel } from "./BlockersPanel";
import { LeadStatTiles } from "./LeadStatTiles";
import { LeadStats } from "./LeadStats";
import { LeadsToAddress } from "./LeadsToAddress";
import { PerformancePanel } from "./PerformancePanel";
import { PipelinePanel } from "./PipelinePanel";
import { RecentApplicants } from "./RecentApplicants";
import { RemindersPanel } from "./RemindersPanel";
import { TodayPanel } from "./TodayPanel";
import { WorkloadPanel } from "./WorkloadPanel";
import type { DashboardBandProps } from "./DashboardBands.types";

/**
 * The body of each tab — the cards only, never the grid.
 *
 * Every band returns bare `Grid.Col`s so the `SectionBand` around it still owns
 * the twelve columns: a card is 6/12 or 4/12 or 2/12 of the PAGE, never of some
 * nested grid that happens to look similar. Splitting the bands out of
 * `DashboardOverview` is what lets the page read as its own structure — header,
 * headline figures, tab bar — instead of nine hundred lines of cards.
 *
 * Every card measures against the same twelve columns: a large card is half the
 * page, a stat card a sixth, and the tile column a sixth of that half — so a
 * card's width tells you what kind of thing it is before you read it.
 */
const LARGE = { base: 12, lg: 6 } as const;
const MEDIUM = { base: 12, sm: 8, lg: 4 } as const;
const SMALL = { base: 12, sm: 4, lg: 2 } as const;

/**
 * Leads: the figures on the left, the day's queue on the right. The queue holds
 * the band's 6/12 ACTION slot because leads decay faster than anything else on
 * this page — the shape of the pipeline is context for it, not the point.
 */
export function LeadsBand({ filters }: DashboardBandProps) {
  return (
    <>
      <Grid.Col span={MEDIUM}>
        <LeadStats filters={filters} />
      </Grid.Col>
      <Grid.Col span={SMALL}>
        <LeadStatTiles filters={filters} />
      </Grid.Col>
      <Grid.Col span={LARGE}>
        <LeadsToAddress filters={filters} />
      </Grid.Col>
    </>
  );
}

/**
 * Applicants: where the book of work is going, what we owe the people in it,
 * and who has just joined.
 */
export function ApplicantsBand({ filters }: DashboardBandProps) {
  const { reminders: canUseReminders } = useCapabilities();

  return (
    <>
      <Grid.Col span={MEDIUM}>
        <ApplicantCountryStats filters={filters} />
      </Grid.Col>
      <Grid.Col span={SMALL}>
        <ApplicantStatTiles filters={filters} />
      </Grid.Col>
      {/* The right-hand 6/12 of a band is that band's ACTION slot — the Leads
          tab puts its day's queue here, not its figures. Follow-ups is the
          applicant equivalent: a dated debt against one of these records, and
          the thing most likely to decay if unread. "Who just joined" is context
          and drops below it.

          Placement is also load-bearing for access. A `custom_reminder` alert is
          routed to Admins only, so a `lead_manager`'s own due work surfaces
          nowhere automatically — the reminders contract's §9 names this query as
          the client-side answer — and the Applicants tab is one of the two tabs
          that tier is given. */}
      {canUseReminders && (
        <Grid.Col span={LARGE}>
          <RemindersPanel />
        </Grid.Col>
      )}
      <Grid.Col span={LARGE}>
        <RecentApplicants filters={filters} />
      </Grid.Col>
    </>
  );
}

/**
 * Operations: six standing measures, admin-only. The eight alerts that used to
 * open this band now live above the tab bar, where both staff tiers see them —
 * what is left here is the office's measurement, not the day's exceptions.
 */
export function OperationsBand({ filters }: DashboardBandProps) {
  return (
    <>
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
        {/* Remounted per fiscal year: the panel pages internally, and page 3 of
            last year is not page 3 of this one. */}
        <ActivityPanel
          key={filters.fiscalYear}
          fiscalYear={filters.fiscalYear}
        />
      </Grid.Col>
    </>
  );
}
