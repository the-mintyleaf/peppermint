"use client";

import { Stack, Group, Title, Text, Paper, SegmentedControl, Skeleton, Table, Badge } from "@peppermint/ui";
import { LineChart } from "@peppermint/ui";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBenchmark } from "../../analytics.api";
import { analyticsQueryKeys } from "../../analytics.queryKeys";

export function Benchmark() {
  const [period, setPeriod] = useState("30d");
  const { data, isLoading } = useQuery({
    queryKey: analyticsQueryKeys.benchmark(period),
    queryFn: () => fetchBenchmark(period),
  });

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={3}>Benchmark</Title>
            <Text c="dimmed" size="sm">Compare your performance against competitors</Text>
          </Stack>
          <SegmentedControl size="xs" value={period} onChange={setPeriod} data={["7d", "30d", "90d"].map((v) => ({ label: v, value: v }))} />
        </Group>
      </Paper>

      {isLoading ? (
        <><Skeleton h={280} radius="md" /><Skeleton h={200} radius="md" /></>
      ) : data ? (
        <>
          <Paper withBorder radius="md" p="md">
            <Text fw={500} size="sm" mb="sm">Volume Comparison</Text>
            <LineChart
              h={240}
              data={data.volumeSeries}
              dataKey="date"
              series={[
                { name: "own", color: "blue", label: "Your Brand" },
                { name: "competitor", color: "red", label: "Competitors" },
              ]}
              curveType="natural"
            />
          </Paper>

          <Paper withBorder radius="md" p="md">
            <Text fw={500} size="sm" mb="sm">Competitor Comparison</Text>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Handle</Table.Th>
                  <Table.Th>Platform</Table.Th>
                  <Table.Th>Avg Engagement</Table.Th>
                  <Table.Th>Follower Growth</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.competitors.map((c) => (
                  <Table.Tr key={c.handle}>
                    <Table.Td><Text size="sm">{c.handle}</Text></Table.Td>
                    <Table.Td><Badge size="xs" variant="light">{c.platform}</Badge></Table.Td>
                    <Table.Td><Text size="sm">{c.avgEngagement}%</Text></Table.Td>
                    <Table.Td><Text size="sm">+{c.followerGrowth}%</Text></Table.Td>
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
