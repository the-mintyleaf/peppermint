"use client";

import { Card, Grid, SimpleGrid, Stack, Text } from "@peppermint/ui";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { useDashboardConversion } from "../dashboard.hooks";
import type { SourceConversionRow } from "../dashboard.types";
import { Gauge } from "./Gauge";
import { SectionState } from "./SectionState";
import { StackedBarChart } from "./StackedBarChart";
import type { ConversionProps } from "./Conversion.types";

// Meaningful, calm colors: converted = a good outcome (green), in-progress = still
// live (blue), lost = expected attrition, kept neutral (gray) rather than alarm-red so
// the eye isn't pulled to a normal state.
const SOURCE_SERIES = [
  { name: "converted", label: "Converted", color: "green" },
  { name: "in_progress", label: "In progress", color: "blue" },
  { name: "lost", label: "Lost", color: "gray" },
];

function BySource({ rows }: { rows: SourceConversionRow[] }) {
  if (rows.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        No sources with a lead in this window.
      </Text>
    );
  }
  const data = rows.map((row) => ({
    source: row.source_name,
    converted: row.converted,
    in_progress: row.in_progress,
    lost: row.lost,
  }));
  return (
    <StackedBarChart
      data={data}
      indexKey="source"
      series={SOURCE_SERIES}
      ariaLabel="Leads by source, split into converted, in progress and lost"
    />
  );
}

/**
 * Four INDEPENDENT rates — never a funnel, never multiplied (INTEGRATION.md §7:
 * each is windowed on its own stage's dates). `by_source`/`lead_to_applicant`
 * are owner-scoped for a Lead Manager; the payload carries no per-field flag
 * (§9), so the caption is derived from the caller's own authority.
 */
export function Conversion({ filters }: ConversionProps) {
  const { isLeadManager } = useCurrentUser();
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardConversion(filters);

  return (
    <SectionState
      isPending={isPending}
      isError={isError}
      errorMessage="Couldn't load conversion figures."
      onRetry={() => refetch()}
      isRetrying={isRefetching}
      skeletonHeight={220}
    >
      {data ? (
        <Grid>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Card withBorder radius="lg" p="lg" h="100%">
              <Stack gap="lg" h="100%">
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
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
                {isLeadManager ? (
                  <Text size="xs" c="dimmed" fs="italic">
                    Lead → Applicant and By source are scoped to your own leads.
                  </Text>
                ) : null}
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Card withBorder radius="lg" p="lg" h="100%">
              <Stack gap="md">
                <Text fw={600} size="sm">
                  Leads by source
                </Text>
                <BySource rows={data.by_source} />
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      ) : null}
    </SectionState>
  );
}
