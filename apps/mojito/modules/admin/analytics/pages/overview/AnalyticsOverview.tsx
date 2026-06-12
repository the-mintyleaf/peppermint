"use client";

import {
  Stack,
  Group,
  Title,
  Text,
  Paper,
  SimpleGrid,
  SegmentedControl,
  Skeleton,
  Badge,
  Table,
} from "@zetsel/ui";
import { AreaChart, DonutChart } from "@zetsel/ui";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchOverview } from "../../analytics.api";
import { analyticsQueryKeys } from "../../analytics.queryKeys";

function KPICard({ label, value, delta }: { label: string; value: string; delta?: number }) {
  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="xs">
        <Text size="xs" c="dimmed" tt="uppercase" fw={500}>{label}</Text>
        <Text size="xl" fw={700}>{value}</Text>
        {delta !== undefined && (
          <Badge size="xs" color={delta >= 0 ? "green" : "red"} variant="light">
            {delta >= 0 ? "+" : ""}{delta}%
          </Badge>
        )}
      </Stack>
    </Paper>
  );
}

export function AnalyticsOverview() {
  const [period, setPeriod] = useState("30d");
  const { data, isLoading } = useQuery({
    queryKey: analyticsQueryKeys.overview(period),
    queryFn: () => fetchOverview(period),
  });

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={3}>Analytics Overview</Title>
            <Text c="dimmed" size="sm">Cross-channel performance at a glance</Text>
          </Stack>
          <SegmentedControl
            size="xs"
            value={period}
            onChange={setPeriod}
            data={[{ label: "7d", value: "7d" }, { label: "30d", value: "30d" }, { label: "90d", value: "90d" }]}
          />
        </Group>
      </Paper>

      {isLoading ? (
        <>
          <SimpleGrid cols={{ base: 2, md: 4 }}><Skeleton h={100} /><Skeleton h={100} /><Skeleton h={100} /><Skeleton h={100} /></SimpleGrid>
          <Skeleton h={280} radius="md" />
        </>
      ) : data ? (
        <>
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
            <KPICard label="Impressions" value={data.kpis.impressions.toLocaleString()} delta={data.kpis.impressionsDelta} />
            <KPICard label="Reach" value={data.kpis.reach.toLocaleString()} delta={data.kpis.reachDelta} />
            <KPICard label="Engagement Rate" value={`${data.kpis.engagementRate}%`} />
            <KPICard label="Follower Growth" value={`${data.kpis.followerGrowth}%`} />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <Paper withBorder radius="md" p="md">
              <Text fw={500} size="sm" mb="sm">Impression Trend</Text>
              <AreaChart
                h={200}
                data={data.trendSeries}
                dataKey="date"
                series={[{ name: "value", color: "blue" }]}
                curveType="natural"
              />
            </Paper>
            <Paper withBorder radius="md" p="md">
              <Text fw={500} size="sm" mb="sm">Platform Breakdown</Text>
              <DonutChart
                h={200}
                data={data.platformBreakdown.map((p) => ({ name: p.platform, value: p.pct, color: "blue" }))}
                withLabels
              />
            </Paper>
          </SimpleGrid>

          <Paper withBorder radius="md" p="md">
            <Text fw={500} size="sm" mb="sm">Top Posts</Text>
            <Table>
              <Table.Thead>
                <Table.Tr><Table.Th>Post</Table.Th><Table.Th>Impressions</Table.Th><Table.Th>Engagements</Table.Th></Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.topPosts.map((p) => (
                  <Table.Tr key={p.id}>
                    <Table.Td><Text size="sm">{p.title}</Text></Table.Td>
                    <Table.Td><Text size="sm">{p.impressions.toLocaleString()}</Text></Table.Td>
                    <Table.Td><Text size="sm">{p.engagement.toLocaleString()}</Text></Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </>
      ) : null}
    </Stack>
  );
}
