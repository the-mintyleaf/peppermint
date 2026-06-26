"use client";

import {
  Stack,
  Group,
  Title,
  Text,
  Paper,
  SegmentedControl,
  Skeleton,
  Tabs,
} from "@peppermint/ui";
import { LineChart, BarChart } from "@peppermint/ui";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchChannelPerformance } from "../../analytics.api";
import { analyticsQueryKeys } from "../../analytics.queryKeys";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "grape",
  tiktok: "dark",
  linkedin: "indigo",
  x: "gray",
};

export function ChannelPerformance() {
  const [period, setPeriod] = useState("30d");
  const [platform, setPlatform] = useState("instagram");

  const { data, isLoading } = useQuery({
    queryKey: analyticsQueryKeys.channelPerformance(period),
    queryFn: () => fetchChannelPerformance(period),
  });

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={3}>Channel Performance</Title>
            <Text c="dimmed" size="sm">
              Per-platform follower and engagement trends
            </Text>
          </Stack>
          <SegmentedControl
            size="xs"
            value={period}
            onChange={setPeriod}
            data={[
              { label: "7d", value: "7d" },
              { label: "30d", value: "30d" },
              { label: "90d", value: "90d" },
            ]}
          />
        </Group>
      </Paper>

      {isLoading ? (
        <>
          <Skeleton h={300} radius="md" />
          <Skeleton h={300} radius="md" />
        </>
      ) : data ? (
        <Tabs value={platform} onChange={(v) => setPlatform(v ?? "instagram")}>
          <Tabs.List>
            {data.platforms.map((p) => (
              <Tabs.Tab key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          {data.platforms.map((p) => (
            <Tabs.Panel key={p} value={p} pt="md">
              <Stack gap="md">
                <Paper withBorder radius="md" p="md">
                  <Text fw={500} size="sm" mb="sm">
                    Follower Growth
                  </Text>
                  <LineChart
                    h={220}
                    data={data.followerGrowth[p] ?? []}
                    dataKey="date"
                    series={[
                      {
                        name: "value",
                        color: PLATFORM_COLORS[p] ?? "blue",
                        label: "Followers gained",
                      },
                    ]}
                    curveType="natural"
                  />
                </Paper>
                <Paper withBorder radius="md" p="md">
                  <Text fw={500} size="sm" mb="sm">
                    Engagement Rate (%)
                  </Text>
                  <BarChart
                    h={220}
                    data={data.engagementRate[p] ?? []}
                    dataKey="date"
                    series={[
                      {
                        name: "value",
                        color: PLATFORM_COLORS[p] ?? "blue",
                        label: "Engagement %",
                      },
                    ]}
                  />
                </Paper>
              </Stack>
            </Tabs.Panel>
          ))}
        </Tabs>
      ) : null}
    </Stack>
  );
}
