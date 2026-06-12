"use client";

import { Stack, Group, Title, Text, Paper, SegmentedControl, Skeleton, SimpleGrid } from "@zetsel/ui";
import { DonutChart, BarChart } from "@zetsel/ui";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAudience } from "../../analytics.api";
import { analyticsQueryKeys } from "../../analytics.queryKeys";

export function Audience() {
  const [period, setPeriod] = useState("30d");
  const { data, isLoading } = useQuery({
    queryKey: analyticsQueryKeys.audience(period),
    queryFn: () => fetchAudience(period),
  });

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={3}>Audience</Title>
            <Text c="dimmed" size="sm">Demographics, geography, and active hours</Text>
          </Stack>
          <SegmentedControl size="xs" value={period} onChange={setPeriod} data={["7d", "30d", "90d"].map((v) => ({ label: v, value: v }))} />
        </Group>
      </Paper>

      {isLoading ? (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Skeleton h={280} radius="md" />
          <Skeleton h={280} radius="md" />
          <Skeleton h={200} radius="md" />
        </SimpleGrid>
      ) : data ? (
        <>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <Paper withBorder radius="md" p="md">
              <Text fw={500} size="sm" mb="sm">Age & Gender</Text>
              <DonutChart
                h={220}
                data={data.ageGender.map((g) => ({ name: g.group, value: g.pct, color: "blue" }))}
                withLabels
              />
            </Paper>
            <Paper withBorder radius="md" p="md">
              <Text fw={500} size="sm" mb="sm">Top Countries</Text>
              <BarChart
                h={220}
                data={data.geo.map((g) => ({ country: g.country, value: g.pct }))}
                dataKey="country"
                series={[{ name: "value", color: "indigo", label: "%" }]}
              />
            </Paper>
          </SimpleGrid>

          <Paper withBorder radius="md" p="md">
            <Text fw={500} size="sm" mb="sm">Active Hours (UTC)</Text>
            <BarChart
              h={160}
              data={data.activeHours.map((h) => ({ hour: String(h.hour), value: h.value }))}
              dataKey="hour"
              series={[{ name: "value", color: "teal", label: "Activity" }]}
            />
          </Paper>
        </>
      ) : null}
    </Stack>
  );
}
