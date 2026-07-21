"use client";

import { Box, SimpleGrid, Stack, Text } from "@peppermint/ui";

import { tokens } from "@/config/design";
import { KpiTile } from "./components/KpiTile";
import { MomentumStrip } from "./components/MomentumStrip";
import type { MetricsRailProps } from "./MetricsRail.types";

export function MetricsRail({
  kpis,
  momentum,
  onPlanTomorrow,
}: MetricsRailProps) {
  return (
    <Stack gap={16} style={{ padding: 18 }}>
      <Box>
        <Text
          component="h3"
          fw={700}
          c={tokens.ink}
          mb={13}
          style={{ fontSize: 15, letterSpacing: "-0.2px" }}
        >
          This week
        </Text>
        <SimpleGrid cols={2} spacing={10}>
          {kpis.map((kpi) => (
            <KpiTile key={kpi.id} kpi={kpi} />
          ))}
        </SimpleGrid>
      </Box>
      <MomentumStrip momentum={momentum} onPlanTomorrow={onPlanTomorrow} />
    </Stack>
  );
}
