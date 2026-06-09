"use client";

import { useState } from "react";
import { Paper, Stack, Group, Text, SegmentedControl, Divider, ScrollArea } from "@zetsel/ui";
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
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)" style={{ overflow: "hidden" }}>
      <ScrollArea h="100%">
        <Stack gap="xl" p="lg">
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Text size="lg" fw={600}>
                Analytics
              </Text>
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

          {summaryData && <StatCards summary={summaryData.summary} />}

          <Divider />

          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Content Volume Over Time
            </Text>
            {contentData && <ContentVolumeChart series={contentData.series} />}
          </Stack>

          <Divider />

          <Group align="flex-start" grow>
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                Automation Performance (Top 10)
              </Text>
              {automationsData && (
                <AutomationPerformanceChart rows={automationsData.automations} />
              )}
            </Stack>
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                Content by Platform
              </Text>
              {contentData && <PlatformDonutChart byPlatform={contentData.byPlatform} />}
            </Stack>
          </Group>

          <Divider />

          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Automation Stats
            </Text>
            {automationsData && (
              <AutomationStatsTable rows={automationsData.automations} />
            )}
          </Stack>
        </Stack>
      </ScrollArea>
    </Paper>
  );
}
