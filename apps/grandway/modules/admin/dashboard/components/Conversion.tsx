"use client";

import {
  Box,
  Card,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from "@peppermint/ui";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { useDashboardConversion } from "../dashboard.hooks";
import type { SourceConversionRow } from "../dashboard.types";
import { Gauge } from "./Gauge";
import { SectionState } from "./SectionState";
import { StackedMeter } from "./StackedMeter";
import type { ConversionProps } from "./Conversion.types";

// Meaningful, calm colors: converted = a good outcome (green), in-progress =
// still live (blue), lost = expected attrition, kept neutral (gray) rather than
// alarm-red so the eye isn't pulled to a normal state.
const SOURCE_SEGMENTS = [
  { key: "converted", label: "Converted", color: "green" },
  { key: "in_progress", label: "In progress", color: "blue" },
  { key: "lost", label: "Lost", color: "gray" },
] as const;

function LegendDot({ color }: { color: string }) {
  return (
    <Box
      aria-hidden
      style={{
        width: 8,
        height: 8,
        borderRadius: 2,
        background: `var(--mantine-color-${color}-6)`,
      }}
    />
  );
}

function BySource({ rows }: { rows: SourceConversionRow[] }) {
  if (rows.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        No sources with a lead in this window.
      </Text>
    );
  }
  const max = Math.max(1, ...rows.map((r) => r.total));
  return (
    <Stack gap="md">
      <Group gap="md" wrap="wrap">
        {SOURCE_SEGMENTS.map((seg) => (
          <Group key={seg.key} gap={6} wrap="nowrap">
            <LegendDot color={seg.color} />
            <Text size="xs" c="dimmed">
              {seg.label}
            </Text>
          </Group>
        ))}
      </Group>
      <Stack gap="xs">
        {rows.map((row) => (
          <StackedMeter
            key={row.source_id}
            label={row.source_name}
            max={max}
            labelWidth={112}
            segments={SOURCE_SEGMENTS.map((seg) => ({
              label: seg.label,
              color: seg.color,
              value: row[seg.key],
            }))}
            trailing={
              <Text size="xs" fw={600} ff="monospace" w={34} ta="right">
                {row.total}
              </Text>
            }
          />
        ))}
      </Stack>
    </Stack>
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
