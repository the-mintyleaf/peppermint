"use client";

import { Box, Group, Stack, Text } from "@peppermint/ui";
import { Sparkline } from "@peppermint/ui/charts";

import { tokens } from "@/config/design";
import { MOSS } from "../../../../module.api";
import { RATE_EMPTY_COPY, hasEnoughData } from "../../../../Mintflow.hooks";
import type { KpiTileProps } from "./KpiTile.types";

/**
 * One small metric — answers what / trend (spec §10). Rate-kind KPIs without
 * enough history show the "not enough data" copy, never "0%" (spec §11).
 */
export function KpiTile({ kpi }: KpiTileProps) {
  const rateHidden = kpi.kind === "rate" && !hasEnoughData(kpi);

  return (
    <Box
      style={{
        border: `1px solid ${tokens.line}`,
        borderRadius: tokens.radius.card,
        padding: 13,
      }}
    >
      <Stack gap={7}>
        <Text fz="11px" fw={500} c={tokens.muted}>
          {kpi.label}
        </Text>

        {rateHidden ? (
          <Text
            fz="11px"
            fw={500}
            c={tokens.muted2}
            style={{ lineHeight: 1.4 }}
          >
            {RATE_EMPTY_COPY}
          </Text>
        ) : (
          <Group justify="space-between" align="flex-end" wrap="nowrap" gap={8}>
            <Text ff="monospace" fz="26px" fw={700} c={tokens.ink} lh={1}>
              {kpi.value}
            </Text>
            {kpi.sparkline ? (
              <Sparkline
                w={72}
                h={24}
                data={kpi.sparkline}
                curveType="monotone"
                color={MOSS}
                fillOpacity={0.18}
                strokeWidth={1.6}
              />
            ) : null}
          </Group>
        )}

        {!rateHidden && kpi.trend ? (
          <Text fz="10px" fw={600} c={tokens.muted}>
            {kpi.trend}
          </Text>
        ) : null}

        {kpi.detail ? (
          <Text fz="10px" fw={500} c={tokens.muted}>
            {kpi.detail}
          </Text>
        ) : null}
      </Stack>
    </Box>
  );
}
