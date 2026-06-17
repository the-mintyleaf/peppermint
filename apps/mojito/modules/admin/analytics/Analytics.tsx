"use client";

import { useState } from "react";
import { Paper, Stack, Group, Text, SegmentedControl, Divider } from "@peppermint/ui";
import { useQuery } from "@tanstack/react-query";
import { StatCards } from "./components/StatCards";
import { ContentVolumeChart } from "./components/ContentVolumeChart";
import { AutomationPerformanceChart } from "./components/AutomationPerformanceChart";
import { PlatformDonutChart } from "./components/PlatformDonutChart";
import { AutomationStatsTable } from "./components/AutomationStatsTable";
import { fetchSummary, fetchAutomationStats, fetchContentVolume } from "./analytics.api";
import { analyticsQueryKeys } from "./analytics.queryKeys";
import type { AnalyticsPeriod } from "./Analytics.types";

const PERIOD_OPTIONS = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

export function Analytics() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");

  const { data: summaryData } = useQuery({
    queryKey: analyticsQueryKeys.summary(period),
    queryFn: () => fetchSummary(period),
  });

  const { data: automationsData } = useQuery({
    queryKey: analyticsQueryKeys.automations(period),
    queryFn: () => fetchAutomationStats(period),
  });

  const { data: contentData } = useQuery({
    queryKey: analyticsQueryKeys.content(period),
    queryFn: () => fetchContentVolume(period),
  });

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Text size="lg" fw={600}>Post Analysis</Text>
            <Text size="sm" c="dimmed">
              Aggregate performance across all automations and content
            </Text>
          </Stack>
          <SegmentedControl
            value={period}
            onChange={(v) => setPeriod(v as AnalyticsPeriod)}
            data={PERIOD_OPTIONS}
            size="xs"
          />
        </Group>
      </Paper>

      {summaryData && <StatCards summary={summaryData.summary} />}

      <Paper p="lg" radius="md" withBorder>
        <Stack gap="xs">
          <Text size="sm" fw={500}>Content Volume Over Time</Text>
          {contentData && <ContentVolumeChart series={contentData.series} />}
        </Stack>
      </Paper>

      <Group align="flex-start" grow>
        <Paper p="lg" radius="md" withBorder style={{ flex: 1 }}>
          <Stack gap="xs">
            <Text size="sm" fw={500}>Automation Performance (Top 10)</Text>
            {automationsData && (
              <AutomationPerformanceChart rows={automationsData.automations} />
            )}
          </Stack>
        </Paper>
        <Paper p="lg" radius="md" withBorder style={{ flex: 1 }}>
          <Stack gap="xs">
            <Text size="sm" fw={500}>Content by Platform</Text>
            {contentData && <PlatformDonutChart byPlatform={contentData.byPlatform} />}
          </Stack>
        </Paper>
      </Group>

      <Paper p="lg" radius="md" withBorder>
        <Stack gap="xs">
          <Text size="sm" fw={500}>Automation Stats</Text>
          {automationsData && (
            <AutomationStatsTable rows={automationsData.automations} />
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
