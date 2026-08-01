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
  useDashboardConversion,
  useDashboardPipeline,
  useDashboardToday,
} from "../dashboard.hooks";
import {
  APPLICANT_STATUS_COLORS,
  APPLICANT_STATUS_LABELS,
} from "../dashboard.labels";
import { DASHBOARD_TAB_META, type DashboardTab } from "../dashboard.tabs";
import type {
  ApplicantStatusKey,
  JourneyStageKey,
  Preview,
  ChecklistItemRow,
} from "../dashboard.types";
import { CategoryBarChart } from "./CategoryBarChart";
import { ChecklistItemRowView } from "./ChecklistItemRowView";
import { CountryCards } from "./CountryCards";
import { DonutStat } from "./DonutStat";
import { Gauge } from "./Gauge";
import { SectionState } from "./SectionState";
import { StatTiles } from "./StatTiles";
import type {
  OverviewPanelProps,
  OverviewSectionProps,
} from "./OverviewPanel.types";

/**
 * The landing view, read top to bottom as one sentence: **what are the numbers →
 * which destination → what shape is the pipeline in → what do I open first.**
 *
 * 1. `StatTiles` — every top-level figure `/summary/` returns; the alerts are
 *    buttons into their tab.
 * 2. `CountryCards` — the destination comparison, one request per country
 *    (there is no group-by endpoint); activating one scopes the whole page.
 * 3. Charts — journeys by stage (magnitude → bar), applicants by status
 *    (breakdown → donut), the four conversion rates (rate → semicircle gauge).
 *    Chart grammar per the module's shared rules; nothing here is decorative.
 * 4. The two checklist queues that drive daily work, as real preview rows.
 *
 * Everything else — the other four worklists, blocker groups, per-owner
 * workload, outcomes, the activity feed — is one tab away, unduplicated.
 */
export function OverviewPanel({
  filters,
  onOpenTab,
  onSelectCountry,
}: OverviewPanelProps) {
  return (
    <Stack gap="lg">
      <StatTiles filters={filters} onOpenTab={onOpenTab} />

      <Stack gap="sm">
        <Group justify="space-between" align="baseline">
          <Text fw={600} size="sm">
            Destinations
          </Text>
          <Text size="xs" c="dimmed" ff="monospace">
            journeys per country
          </Text>
        </Group>
        <CountryCards
          fiscalYear={filters.fiscalYear}
          selectedCountry={filters.country}
          onSelectCountry={onSelectCountry}
        />
      </Stack>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <JourneyStageCard filters={filters} onOpenTab={onOpenTab} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <ApplicantStatusCard filters={filters} onOpenTab={onOpenTab} />
        </Grid.Col>
      </Grid>

      <ConversionCard filters={filters} onOpenTab={onOpenTab} />

      <ChecklistQueues filters={filters} onOpenTab={onOpenTab} />
    </Stack>
  );
}

/**
 * Shared chrome: a title, the body, and exactly one quiet action — "the rest of
 * this lives here". The action is a button because it switches tab rather than
 * navigating.
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
          <Group justify="space-between" align="baseline" wrap="nowrap">
            <Text fw={600} size="sm">
              {title}
            </Text>
            <Button
              variant="subtle"
              size="compact-xs"
              rightSection={<ArrowRightIcon size={13} />}
              onClick={() => onOpenTab(tab)}
            >
              {DASHBOARD_TAB_META[tab].label}
            </Button>
          </Group>
          {caption ? (
            <Text size="xs" c="dimmed" mt={-8}>
              {caption}
            </Text>
          ) : null}
          {children}
        </Stack>
      </Stack>
    </Card>
  );
}

/** Journeys by stage — an ordered magnitude, so a single-hue bar chart. */
function JourneyStageCard({ filters, onOpenTab }: OverviewSectionProps) {
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
        skeletonHeight={280}
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

/** Applicants by status — parts of one total, so a donut with a word+value legend. */
function ApplicantStatusCard({ filters, onOpenTab }: OverviewSectionProps) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardPipeline(filters);

  const items = data
    ? (Object.keys(data.applicants_by_status) as ApplicantStatusKey[]).map(
        (key) => ({
          label: APPLICANT_STATUS_LABELS[key],
          value: data.applicants_by_status[key],
          color: APPLICANT_STATUS_COLORS[key],
        }),
      )
    : [];

  return (
    <OverviewCard
      title="Applicants by status"
      caption="Parts of one total."
      tab="pipeline"
      onOpenTab={onOpenTab}
    >
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load pipeline counts."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={280}
      >
        {data ? (
          <DonutStat
            items={items}
            centerValue={items.reduce((sum, item) => sum + item.value, 0)}
            centerLabel="applicants"
          />
        ) : null}
      </SectionState>
    </OverviewCard>
  );
}

/** The four rates as semicircle gauges — independent, never a funnel (§7). */
function ConversionCard({ filters, onOpenTab }: OverviewSectionProps) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardConversion(filters);

  return (
    <OverviewCard
      title="Conversion"
      caption="Four independent rates — never a funnel, never multiplied together. A rate is blank when its denominator is 0."
      tab="performance"
      onOpenTab={onOpenTab}
    >
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load conversion figures."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={160}
      >
        {data ? (
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg">
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
 * The two queues that drive the day, side by side, as REAL preview rows. Both
 * come from the one `today` request, so they are consistent with each other —
 * and they are the only lists Overview carries; the other four worklists are on
 * the Today tab rather than duplicated here.
 */
function ChecklistQueues({ filters, onOpenTab }: OverviewSectionProps) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardToday(filters);

  return (
    <Grid>
      <Grid.Col span={{ base: 12, lg: 6 }}>
        <OverviewCard
          title="Overdue checklist items"
          caption="Past their due date — the server decides overdue, not the browser."
          tab="today"
          onOpenTab={onOpenTab}
        >
          <SectionState
            isPending={isPending}
            isError={isError}
            errorMessage="Couldn't load today's worklists."
            onRetry={() => refetch()}
            isRetrying={isRefetching}
            skeletonHeight={220}
          >
            <QueueRows
              preview={data?.overdue_checklist_items}
              emptyMessage="Nothing overdue — healthy."
            />
          </SectionState>
        </OverviewCard>
      </Grid.Col>

      <Grid.Col span={{ base: 12, lg: 6 }}>
        <OverviewCard
          title="Due soon"
          caption={
            data
              ? `Falling due within ${data.due_within_days} days.`
              : "Falling due inside the server's due-soon horizon."
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
            skeletonHeight={220}
          >
            <QueueRows
              preview={data?.due_soon_checklist_items}
              emptyMessage="Nothing falling due in this window."
            />
          </SectionState>
        </OverviewCard>
      </Grid.Col>
    </Grid>
  );
}

/**
 * A worklist preview. The count badge and the "see all" line read the REAL
 * `total`/`has_more` from the wrapper, never `items.length` — the API caps the
 * preview at 10 rows (INTEGRATION.md §3).
 */
function QueueRows({
  preview,
  emptyMessage,
}: {
  preview: Preview<ChecklistItemRow> | undefined;
  emptyMessage: string;
}) {
  if (!preview) return null;

  if (preview.items.length === 0) {
    return (
      <Text size="sm" c="dimmed" py="xs">
        {emptyMessage}
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      <Text size="xs" c="dimmed" ff="monospace">
        {preview.has_more
          ? `showing ${preview.items.length} of ${preview.total}`
          : `${preview.total} total`}
      </Text>
      {preview.items.map((row) => (
        <ChecklistItemRowView key={row.id} row={row} />
      ))}
    </Stack>
  );
}
