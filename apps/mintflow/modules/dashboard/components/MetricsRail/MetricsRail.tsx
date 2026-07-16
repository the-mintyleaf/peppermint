"use client";

import { SimpleGrid, Stack } from "@peppermint/ui";

import { SectionLabel } from "@/components";
import { KpiTile } from "./components/KpiTile";
import { MomentumStrip } from "./components/MomentumStrip";
import type { MetricsRailProps } from "./MetricsRail.types";

export function MetricsRail({
  kpis,
  momentum,
  onKpiAction,
  onPlanTomorrow,
}: MetricsRailProps) {
  return (
    <Stack gap={12}>
      <SectionLabel>This week</SectionLabel>
      <SimpleGrid cols={2} spacing={12}>
        {kpis.map((kpi) => (
          <KpiTile key={kpi.id} kpi={kpi} onAction={onKpiAction} />
        ))}
      </SimpleGrid>
      <MomentumStrip momentum={momentum} onPlanTomorrow={onPlanTomorrow} />
    </Stack>
  );
}
