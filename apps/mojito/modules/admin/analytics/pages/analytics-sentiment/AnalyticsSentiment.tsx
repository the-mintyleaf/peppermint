"use client";

import { Stack, Group, Title, Text, Paper, SegmentedControl, Skeleton, Badge } from "@zetsel/ui";
import { AreaChart, BarChart } from "@zetsel/ui";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSentimentAnalytics } from "../../analytics.api";
import { analyticsQueryKeys } from "../../analytics.queryKeys";

export function AnalyticsSentiment() {
  const [period, setPeriod] = useState("30d");
  const { data, isLoading } = useQuery({
    queryKey: analyticsQueryKeys.sentimentAnalytics(period),
    queryFn: () => fetchSentimentAnalytics(period),
  });

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={3}>Sentiment Analysis</Title>
            <Text c="dimmed" size="sm">Track brand sentiment over time and by topic</Text>
          </Stack>
          <SegmentedControl size="xs" value={period} onChange={setPeriod} data={["7d", "30d", "90d"].map((v) => ({ label: v, value: v }))} />
        </Group>
      </Paper>

      {isLoading ? (
        <><Skeleton h={280} radius="md" /><Skeleton h={280} radius="md" /></>
      ) : data ? (
        <>
          <Paper withBorder radius="md" p="md">
            <Group justify="space-between" mb="sm">
              <Text fw={500} size="sm">Sentiment Trend</Text>
              <Badge size="lg" color="green">{data.overallScore}% Positive</Badge>
            </Group>
            <AreaChart
              h={240}
              data={data.series}
              dataKey="date"
              series={[
                { name: "positive", color: "green", label: "Positive" },
                { name: "neutral", color: "gray", label: "Neutral" },
                { name: "negative", color: "red", label: "Negative" },
              ]}
              curveType="natural"
              type="stacked"
            />
          </Paper>

          <Paper withBorder radius="md" p="md">
            <Text fw={500} size="sm" mb="sm">By Topic</Text>
            <BarChart
              h={220}
              data={data.topics.map((t) => ({ topic: t.topic, positive: t.positive, negative: t.negative }))}
              dataKey="topic"
              series={[
                { name: "positive", color: "green", label: "Positive" },
                { name: "negative", color: "red", label: "Negative" },
              ]}
            />
          </Paper>
        </>
      ) : null}
    </Stack>
  );
}
