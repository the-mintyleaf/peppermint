"use client";

import { Box, Group, Text } from "@peppermint/ui";
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

const span2 = { gridColumn: "span 2" } as const;

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <MonoText fz={10} c={dark.faint}>
      {children}
    </MonoText>
  );
}

/** Mobile reporting layout: a single ~460px column with a 2-column bento grid. */
export function DashboardMobile({
  period,
  onPeriodChange,
  data,
}: DashboardLayoutProps) {
  return (
    <Box style={{ maxWidth: 460, marginInline: "auto", padding: 20 }}>
      <MonoText label fz={10} c={tokens.accent}>
        MON · 28.03 · ALL ON TRACK
      </MonoText>

      <Group justify="space-between" align="center" wrap="nowrap" mt={10}>
        <Text
          fz={30}
          fw={700}
          c={dark.white}
          style={{ letterSpacing: "-1.2px" }}
        >
          Reports.
        </Text>
        <PeriodToggle period={period} onChange={onPeriodChange} />
      </Group>

      <Box
        mt={18}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          gridAutoRows: "minmax(0, auto)",
        }}
      >
        <CompletionHero
          completion={data.completion}
          ring={data.ring}
          trend={data.trend}
          numberSize={46}
          style={{ gridRow: "span 2" }}
        />

        <KpiTile
          label="CLOSED"
          value={data.closed}
          footer={<Caption>this {data.periodWord}</Caption>}
        />

        <KpiTile
          label="OVERDUE"
          value={data.overdue}
          valueColor={tokens.accent}
          headerDot
          footer={<Caption>need attention</Caption>}
        />

        <Throughput
          bars={data.bars}
          periodLabel={data.periodLabel}
          variant="mobile"
          style={span2}
        />

        <TeamTile />

        <KpiTile
          label="AVG CYCLE"
          value={data.cycle}
          unit="days"
          footer={
            <Group gap={5} align="center" wrap="nowrap">
              <TrendUpIcon size={13} color={tokens.blue} aria-hidden="true" />
              <MonoText fz={11} fw={500} c={tokens.blue}>
                -0.6 vs last
              </MonoText>
            </Group>
          }
        />

        <StatusMix
          total={data.total}
          mix={data.mix}
          legend={data.legend}
          style={span2}
        />

        <TopCase variant="mobile" style={span2} />
      </Box>
    </Box>
  );
}
