"use client";

import { Box, Button, Group, Stack, Text } from "@peppermint/ui";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";

import { tokens } from "@/config/design";
import { MonoText } from "@/components";

import type { DashboardLayoutProps } from "../../Dashboard.types";
import { dark } from "../../Dashboard.utils";
import { CompletionHero } from "../CompletionHero";
import { KpiTile } from "../KpiTile";
import { PeriodToggle } from "../PeriodToggle";
import { StatusMix } from "../StatusMix";
import { TeamTile } from "../TeamTile";
import { Throughput } from "../Throughput";
import { TopCase } from "../TopCase";

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <MonoText fz={11} c={dark.faint}>
      {children}
    </MonoText>
  );
}

/** Desktop reporting layout: sticky-feel top bar over two side-by-side columns. */
export function DashboardDesktop({
  period,
  onPeriodChange,
  data,
}: DashboardLayoutProps) {
  return (
    <Stack gap={0} style={{ minHeight: "100%" }}>
      <Group
        justify="space-between"
        align="center"
        wrap="nowrap"
        style={{
          padding: "38px 56px",
          borderBottom: `1px solid ${dark.border}`,
        }}
      >
        <Group gap={16} align="baseline" wrap="nowrap">
          <MonoText label fz={11} c={tokens.accent}>
            MON · 28.03 · ALL ON TRACK
          </MonoText>
          <Text
            fz={34}
            fw={700}
            c={dark.white}
            style={{ letterSpacing: "-1.4px" }}
          >
            Reports.
          </Text>
        </Group>

        <Group gap={14} align="center" wrap="nowrap">
          <PeriodToggle period={period} onChange={onPeriodChange} />
          <Button
            h={44}
            radius={12}
            leftSection={<DownloadSimpleIcon size={16} aria-hidden="true" />}
            style={{ background: "#fff", color: tokens.ink }}
            onClick={() => {}}
          >
            Export
          </Button>
        </Group>
      </Group>

      <Group align="stretch" gap={0} wrap="nowrap" style={{ flex: 1 }}>
        <Stack
          gap={20}
          style={{ flex: 1, minWidth: 0, padding: "30px 40px 40px 56px" }}
        >
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            <KpiTile
              label="CLOSED"
              value={data.closed}
              valueSize={46}
              footer={<Caption>this {data.periodWord}</Caption>}
            />
            <KpiTile
              label="OVERDUE"
              value={data.overdue}
              valueSize={46}
              valueColor={tokens.accent}
              headerDot
              footer={<Caption>need attention</Caption>}
            />
            <KpiTile
              label="AVG CYCLE"
              value={data.cycle}
              unit="days"
              valueSize={46}
              footer={
                <Group gap={5} align="center" wrap="nowrap">
                  <TrendUpIcon
                    size={13}
                    color={tokens.blue}
                    aria-hidden="true"
                  />
                  <MonoText fz={11} fw={500} c={tokens.blue}>
                    -0.6 vs last
                  </MonoText>
                </Group>
              }
            />
          </Box>

          <Throughput
            bars={data.bars}
            periodLabel={data.periodLabel}
            variant="desktop"
            style={{ minHeight: 300 }}
          />

          <StatusMix total={data.total} mix={data.mix} legend={data.legend} />
        </Stack>

        <Stack
          gap={20}
          style={{
            flex: "0 0 380px",
            borderLeft: `1px solid ${dark.border}`,
            padding: "30px 56px 40px 40px",
          }}
        >
          <CompletionHero
            completion={data.completion}
            ring={data.ring}
            trend={data.trend}
            numberSize={58}
          />
          <TeamTile />
          <TopCase variant="desktop" />
        </Stack>
      </Group>
    </Stack>
  );
}
