"use client";

import type { ReactNode } from "react";
import {
  Button,
  Card,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from "@peppermint/ui";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { STAGE_LABELS as JOURNEY_STAGE_LABELS } from "@/modules/admin/applicant-journeys/applicantJourneys.labels";
import {
  useDashboardBlockers,
  useDashboardConversion,
  useDashboardPipeline,
  useDashboardToday,
} from "../dashboard.hooks";
import {
  BLOCKER_GROUP_LABELS,
  TODAY_WORKLIST_LABELS,
} from "../dashboard.labels";
import { DASHBOARD_TAB_META, type DashboardTab } from "../dashboard.tabs";
import type {
  DashboardBlockers,
  DashboardToday,
  JourneyStageKey,
} from "../dashboard.types";
import { CategoryBarChart } from "./CategoryBarChart";
import { Gauge } from "./Gauge";
import { MeterBar } from "./MeterBar";
import { NeedsAttention } from "./NeedsAttention";
import { SectionState } from "./SectionState";
import type { OverviewPanelProps } from "./OverviewPanel.types";

/**
 * The landing view: exceptions first, then just enough of the pipeline to know
 * whether the shape is normal. Nothing here is a second copy of a section — each
 * card is the section's headline figure set, and the card's one action opens the
 * tab with the rows, the previews and the caveats.
 *
 * Deliberately NOT here: preview rows, per-owner tables, outcome breakdowns and
 * the activity feed. They are a tab away, which is the whole point — a dashboard
 * is a signal board, not a wall of charts (DESIGN.md Layer 2).
 */
export function OverviewPanel({ filters, onOpenTab }: OverviewPanelProps) {
  return (
    <Stack gap="md">
      <Grid>
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <NeedsAttention filters={filters} onOpenTab={onOpenTab} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <JourneyShapeCard filters={filters} onOpenTab={onOpenTab} />
        </Grid.Col>
      </Grid>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <TodayGlanceCard filters={filters} onOpenTab={onOpenTab} />
        <BlockersGlanceCard filters={filters} onOpenTab={onOpenTab} />
        <ConversionGlanceCard filters={filters} onOpenTab={onOpenTab} />
      </SimpleGrid>
    </Stack>
  );
}

/**
 * Shared chrome for a headline card: a title, the summary body, and exactly one
 * quiet action pinned to the bottom — "the rest of this lives here". The action
 * is a button because it changes the view rather than navigating.
 */
function OverviewCard({
  title,
  caption,
  tab,
  onOpenTab,
  children,
}: {
  title: string;
  caption?: string;
  tab: DashboardTab;
  onOpenTab: (tab: DashboardTab) => void;
  children: ReactNode;
}) {
  return (
    <Card withBorder radius="lg" p="lg" h="100%">
      <Stack gap="md" h="100%" justify="space-between">
        <Stack gap="md">
          <Stack gap={2}>
            <Text fw={600} size="sm">
              {title}
            </Text>
            {caption ? (
              <Text size="xs" c="dimmed">
                {caption}
              </Text>
            ) : null}
          </Stack>
          {children}
        </Stack>

        <Group justify="flex-start">
          <Button
            variant="subtle"
            size="compact-sm"
            rightSection={<ArrowRightIcon size={14} />}
            onClick={() => onOpenTab(tab)}
          >
            Open {DASHBOARD_TAB_META[tab].label}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}

/**
 * Where the book of work actually sits. Journeys by stage is the one pipeline
 * measure that answers "is the shape normal?" on its own — leads, applicants,
 * offers, checklists, documents and files are all one click away on Pipeline.
 */
function JourneyShapeCard({ filters, onOpenTab }: OverviewPanelProps) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardPipeline(filters);

  return (
    <OverviewCard
      title="Journeys by stage"
      caption="Zero-filled — every stage always shows, windowed on creation date."
      tab="pipeline"
      onOpenTab={onOpenTab}
    >
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load pipeline counts."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={260}
      >
        {data ? (
          <CategoryBarChart
            orientation="horizontal"
            color="brand"
            ariaLabel="Journeys by stage"
            items={(
              Object.keys(data.journeys_by_stage) as JourneyStageKey[]
            ).map((key) => ({
              label: JOURNEY_STAGE_LABELS[key],
              value: data.journeys_by_stage[key],
            }))}
          />
        ) : null}
      </SectionState>
    </OverviewCard>
  );
}

/** The six queues as totals only — the ≤10-row previews live on the Today tab. */
function TodayGlanceCard({ filters, onOpenTab }: OverviewPanelProps) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardToday(filters);

  const rows = data
    ? (
        Object.keys(TODAY_WORKLIST_LABELS) as Array<
          keyof typeof TODAY_WORKLIST_LABELS
        >
      ).map((key) => ({
        label: TODAY_WORKLIST_LABELS[key],
        value: (data[key as keyof DashboardToday] as { total: number }).total,
      }))
    : [];

  return (
    <OverviewCard
      title="Today's queues"
      caption={
        data ? `Due-soon horizon: ${data.due_within_days} days.` : undefined
      }
      tab="today"
      onOpenTab={onOpenTab}
    >
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load today's worklists."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={180}
      >
        <TotalsMeters rows={rows} />
      </SectionState>
    </OverviewCard>
  );
}

/** The five blocker groups as totals only — an all-zero card is the healthy state. */
function BlockersGlanceCard({ filters, onOpenTab }: OverviewPanelProps) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardBlockers(filters);

  const rows = data
    ? (
        Object.keys(BLOCKER_GROUP_LABELS) as Array<
          keyof typeof BLOCKER_GROUP_LABELS
        >
      ).map((key) => ({
        label: BLOCKER_GROUP_LABELS[key],
        value: (data[key as keyof DashboardBlockers] as { total: number })
          .total,
      }))
    : [];

  const allClear = rows.length > 0 && rows.every((row) => row.value === 0);

  return (
    <OverviewCard
      title="Blockers"
      caption="Five causes, never merged — an empty group is healthy."
      tab="blockers"
      onOpenTab={onOpenTab}
    >
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load blockers and risk."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={180}
      >
        <Stack gap="sm">
          {allClear ? (
            <Text size="sm" c="dimmed">
              Nothing is stuck — all five groups are clear.
            </Text>
          ) : null}
          <TotalsMeters rows={rows} color="orange" />
        </Stack>
      </SectionState>
    </OverviewCard>
  );
}

/** The four rates, gauge-only — `by_source` and the outcome rings are a tab away. */
function ConversionGlanceCard({ filters, onOpenTab }: OverviewPanelProps) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardConversion(filters);

  return (
    <OverviewCard
      title="Conversion"
      caption="Four independent rates — never a funnel, never multiplied."
      tab="performance"
      onOpenTab={onOpenTab}
    >
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load conversion figures."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={180}
      >
        {data ? (
          <SimpleGrid cols={2} spacing="md">
            <Gauge
              percent={data.rates.lead_to_applicant.percent}
              label="Lead → Applicant"
              caption={`${data.rates.lead_to_applicant.numerator.toLocaleString()} / ${data.rates.lead_to_applicant.denominator.toLocaleString()}`}
            />
            <Gauge
              percent={data.rates.applicant_to_journey.percent}
              label="Applicant → Journey"
              caption={`${data.rates.applicant_to_journey.numerator.toLocaleString()} / ${data.rates.applicant_to_journey.denominator.toLocaleString()}`}
            />
            <Gauge
              percent={data.rates.journey_to_offer.percent}
              label="Journey → Offer"
              caption={`${data.rates.journey_to_offer.numerator.toLocaleString()} / ${data.rates.journey_to_offer.denominator.toLocaleString()}`}
            />
            <Gauge
              percent={data.rates.offer_acceptance.percent}
              label="Offer acceptance"
              caption={`${data.rates.offer_acceptance.numerator.toLocaleString()} / ${data.rates.offer_acceptance.denominator.toLocaleString()}`}
            />
          </SimpleGrid>
        ) : null}
      </SectionState>
    </OverviewCard>
  );
}

/**
 * A set of `Preview.total` figures as comparable bars, biggest first. These are
 * facts, not controls — the card's single action carries the navigation, so the
 * rows stay inert (DESIGN.md: state and action must not blur).
 */
function TotalsMeters({
  rows,
  color = "gray",
}: {
  rows: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  const ordered = [...rows].sort((a, b) => b.value - a.value);

  return (
    <Stack gap="sm">
      {ordered.map((row) => (
        <MeterBar
          key={row.label}
          label={row.label}
          value={row.value}
          max={max}
          color={color}
          muted={row.value === 0}
          labelWidth={150}
        />
      ))}
    </Stack>
  );
}
