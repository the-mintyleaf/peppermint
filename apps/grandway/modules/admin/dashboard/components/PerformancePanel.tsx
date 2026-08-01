"use client";

import { useState } from "react";
import { SimpleGrid, Stack, Text } from "@peppermint/ui";
import { ChartLineUpIcon } from "@phosphor-icons/react/dist/csr/ChartLineUp";
import { OUTCOME_LABELS } from "@/modules/admin/applicant-journeys/applicantJourneys.labels";
import { DECISION_OUTCOME_LABELS } from "@/modules/admin/offers/offers.labels";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import {
  useDashboardConversion,
  useDashboardOutcomes,
} from "../dashboard.hooks";
import {
  JOURNEY_OUTCOME_COLORS,
  OFFER_DECISION_COLORS,
} from "../dashboard.labels";
import type {
  DashboardConversion,
  DashboardOutcomes,
} from "../dashboard.types";
import { DonutStat } from "./DonutStat";
import { Gauge } from "./Gauge";
import { MeterBar } from "./MeterBar";
import { PanelCard } from "./PanelCard";
import { SectionState } from "./SectionState";
import { StackedBarChart } from "./StackedBarChart";
import type { PerformancePanelProps } from "./PerformancePanel.types";

/**
 * Converted is a good outcome (green), in-progress is still live (blue), lost is
 * expected attrition and stays neutral gray rather than alarm-red — the eye must
 * not be pulled to a normal state.
 */
const SOURCE_SERIES = [
  { name: "converted", label: "Converted", color: "green" },
  { name: "in_progress", label: "In progress", color: "blue" },
  { name: "lost", label: "Lost", color: "gray" },
];

const VIEWS = [
  {
    value: "rates",
    label: "Conversion rates",
    description: "Four independent rates — never a funnel",
  },
  {
    value: "sources",
    label: "Leads by source",
    description: "Which sources actually convert",
  },
  {
    value: "journey_outcomes",
    label: "Journey outcomes",
    description: "Windowed on when each journey ended",
  },
  {
    value: "offer_decisions",
    label: "Offer decisions",
    description: "Keyed on when each decision was recorded",
  },
  {
    value: "settled",
    label: "Closed & archived",
    description: "Created in this window — a separate count",
  },
];

/** The two windows that must never be added together, stated where they are read. */
const CAVEATS: Record<string, string> = {
  journey_outcomes: "Windowed on when each journey ENDED.",
  settled: "Windowed on CREATION — not part of the outcomes ring.",
};

function Rates({ rates }: { rates: DashboardConversion["rates"] }) {
  const entries = [
    { key: "lead_to_applicant", label: "Lead → Applicant" },
    { key: "applicant_to_journey", label: "Applicant → Journey" },
    { key: "journey_to_offer", label: "Journey → Offer" },
    { key: "offer_acceptance", label: "Offer acceptance" },
  ] as const;

  return (
    <SimpleGrid cols={{ base: 2 }} spacing="lg">
      {entries.map((entry) => {
        const rate = rates[entry.key];
        return (
          <Gauge
            key={entry.key}
            percent={rate.percent}
            label={entry.label}
            caption={`${rate.numerator.toLocaleString()} / ${rate.denominator.toLocaleString()}`}
          />
        );
      })}
    </SimpleGrid>
  );
}

function SettledBars({ data }: { data: DashboardOutcomes }) {
  const rows = [
    { key: "journeys_completed", label: "Journeys completed" },
    { key: "journeys_closed", label: "Journeys closed" },
    { key: "checklists_completed", label: "Checklists completed" },
    { key: "checklists_archived", label: "Checklists archived" },
    { key: "applicants_dormant", label: "Applicants dormant" },
    { key: "applicants_archived", label: "Applicants archived" },
  ] as const;
  const max = Math.max(1, ...rows.map((row) => data[row.key]));

  return (
    <Stack gap="xs">
      {rows.map((row) => (
        <MeterBar
          key={row.key}
          label={row.label}
          value={data[row.key]}
          max={max}
          muted={data[row.key] === 0}
          labelWidth={148}
        />
      ))}
    </Stack>
  );
}

function toOutcomeItems<K extends string>(
  counts: Record<K, number>,
  labels: Record<K, string>,
  colors: Record<K, string>,
) {
  return (Object.keys(counts) as K[]).map((key) => ({
    label: labels[key],
    value: counts[key],
    color: colors[key],
  }));
}

/**
 * How work converts, and how it ended. Two endpoints behind one card because
 * they answer one question between them — but never one total: `journey_outcomes`
 * is windowed on when a journey ENDED and everything under "Closed & archived"
 * on when it was CREATED, so each view states its own window rather than
 * inviting a sum across them (INTEGRATION.md §7).
 *
 * Only the open view's section is fetched: the outcomes request never fires
 * while you are reading rates, and vice versa.
 */
export function PerformancePanel({ filters }: PerformancePanelProps) {
  const [view, setView] = useState("rates");
  const { isLeadManager } = useCurrentUser();
  const isConversionView = view === "rates" || view === "sources";

  // Gated on the open view, so reading rates never pays for the outcomes
  // request. Both stay cached once fetched, so switching back is instant.
  const conversion = useDashboardConversion(filters, isConversionView);
  const outcomes = useDashboardOutcomes(filters, !isConversionView);
  const source = isConversionView ? conversion : outcomes;

  return (
    <PanelCard
      title="Conversion & outcomes"
      subtitle={VIEWS.find((entry) => entry.value === view)?.description}
      icon={ChartLineUpIcon}
      views={VIEWS}
      activeView={view}
      onViewChange={setView}
      minBodyHeight={300}
    >
      <SectionState
        isPending={source.isPending}
        isError={source.isError}
        errorMessage="Couldn't load performance figures."
        onRetry={() => source.refetch()}
        isRetrying={source.isRefetching}
        skeletonHeight={300}
      >
        <Stack gap="sm">
          {isLeadManager && isConversionView ? (
            <Text size="xs" c="dimmed" fs="italic">
              Scoped to your own leads.
            </Text>
          ) : null}
          {CAVEATS[view] ? (
            <Text size="xs" c="dimmed">
              {CAVEATS[view]}
            </Text>
          ) : null}

          {view === "rates" && conversion.data ? (
            <Rates rates={conversion.data.rates} />
          ) : null}

          {view === "sources" && conversion.data ? (
            conversion.data.by_source.length === 0 ? (
              <Text size="sm" c="dimmed">
                No sources with a lead in this window.
              </Text>
            ) : (
              <StackedBarChart
                data={conversion.data.by_source.map((row) => ({
                  source: row.source_name,
                  converted: row.converted,
                  in_progress: row.in_progress,
                  lost: row.lost,
                }))}
                indexKey="source"
                series={SOURCE_SERIES}
                ariaLabel="Leads by source, split into converted, in progress and lost"
              />
            )
          ) : null}

          {view === "journey_outcomes" && outcomes.data ? (
            <DonutStat
              items={toOutcomeItems(
                outcomes.data.journey_outcomes,
                OUTCOME_LABELS,
                JOURNEY_OUTCOME_COLORS,
              )}
              centerValue={Object.values(outcomes.data.journey_outcomes).reduce(
                (sum, value) => sum + value,
                0,
              )}
              centerLabel="closed"
            />
          ) : null}

          {view === "offer_decisions" && outcomes.data ? (
            <DonutStat
              items={toOutcomeItems(
                outcomes.data.offer_decisions,
                DECISION_OUTCOME_LABELS,
                OFFER_DECISION_COLORS,
              )}
              centerValue={Object.values(outcomes.data.offer_decisions).reduce(
                (sum, value) => sum + value,
                0,
              )}
              centerLabel="decisions"
            />
          ) : null}

          {view === "settled" && outcomes.data ? (
            <SettledBars data={outcomes.data} />
          ) : null}
        </Stack>
      </SectionState>
    </PanelCard>
  );
}
