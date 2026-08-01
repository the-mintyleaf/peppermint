"use client";

import { Card, Grid, Stack, Text } from "@peppermint/ui";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { useDashboardConversion } from "../dashboard.hooks";
import type { SourceConversionRow } from "../dashboard.types";
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
 * The `conversion` section's per-source split. The four `rates` gauges are NOT
 * here — Overview renders them, and a tab must not repeat what Overview already
 * shows; both surfaces read the one cached `conversion` request.
 *
 * `by_source` is owner-scoped for a Lead Manager and the payload carries no
 * per-field flag (§9), so the caption is derived from the caller's own authority.
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
          <Grid.Col span={12}>
            <Card withBorder radius="lg" p="lg" h="100%">
              <Stack gap="md">
                <Text fw={600} size="sm">
                  Leads by source
                </Text>
                {isLeadManager ? (
                  <Text size="xs" c="dimmed" fs="italic">
                    Scoped to your own leads.
                  </Text>
                ) : null}
                <BySource rows={data.by_source} />
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      ) : null}
    </SectionState>
  );
}
