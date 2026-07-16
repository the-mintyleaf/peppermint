"use client";

import { Group, Paper, Stack, Text, UnstyledButton } from "@peppermint/ui";
import { Sparkline } from "@peppermint/ui/charts";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";

import { SectionLabel } from "@/components";
import { tokens } from "@/config/design";
import { MOSS } from "../../../../module.api";
import { RATE_EMPTY_COPY, hasEnoughData } from "../../../../Dashboard.hooks";
import type { KpiTileProps } from "./KpiTile.types";

/**
 * One small metric — answers what / trend / action (spec §10). Rate-kind KPIs
 * without enough history show the "not enough data" copy, never "0%" (spec §11).
 */
export function KpiTile({ kpi, onAction }: KpiTileProps) {
  const rateHidden = kpi.kind === "rate" && !hasEnoughData(kpi);

  return (
    <Paper
      withBorder
      radius={tokens.radius.card}
      p={14}
      bg="white"
      style={{ boxShadow: tokens.shadow.card }}
    >
      <Stack gap={8}>
        <SectionLabel>{kpi.label}</SectionLabel>

        {rateHidden ? (
          <Text
            fz="11.5px"
            fw={500}
            c="rgba(0,0,0,0.5)"
            style={{ lineHeight: 1.4 }}
          >
            {RATE_EMPTY_COPY}
          </Text>
        ) : (
          <Group
            justify="space-between"
            align="flex-end"
            wrap="nowrap"
            gap={10}
          >
            <Text ff="monospace" fz="26px" fw={700} c={tokens.ink} lh={1}>
              {kpi.value}
            </Text>
            {kpi.sparkline ? (
              <Sparkline
                w={72}
                h={26}
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
          <Text fz="11px" fw={600} c="rgba(0,0,0,0.45)">
            {kpi.trend}
          </Text>
        ) : null}

        {kpi.detail ? (
          <Text fz="11px" fw={500} c="rgba(0,0,0,0.45)">
            {kpi.detail}
          </Text>
        ) : null}

        <UnstyledButton
          onClick={() => onAction(kpi)}
          style={{ alignSelf: "flex-start" }}
        >
          <Group gap={4} wrap="nowrap" align="center">
            <Text fz="11px" fw={700} c={tokens.accentDark}>
              {kpi.actionLabel}
            </Text>
            <ArrowUpRightIcon
              size={11}
              weight="bold"
              color={tokens.accentDark}
            />
          </Group>
        </UnstyledButton>
      </Stack>
    </Paper>
  );
}
