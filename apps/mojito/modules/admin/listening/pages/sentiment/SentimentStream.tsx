"use client";

import { Stack, Text, Paper, Skeleton, Badge, SimpleGrid, Group } from "@peppermint/ui";
import { AreaChart } from "@peppermint/ui";
import { useSentimentStream } from "../../listening.hooks";

export function SentimentStream() {
  const { data, isLoading } = useSentimentStream();

  const latestPositive = data?.[data.length - 1]?.positive ?? 0;
  const latestNeutral = data?.[data.length - 1]?.neutral ?? 0;
  const latestNegative = data?.[data.length - 1]?.negative ?? 0;
  const total = latestPositive + latestNeutral + latestNegative;
  const sentimentScore = total > 0 ? Math.round((latestPositive / total) * 100) : 0;

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Text size="lg" fw={600}>Sentiment Stream</Text>
            <Text c="dimmed" size="sm">Real-time sentiment trends across monitored channels</Text>
          </Stack>
          {!isLoading && (
            <Badge
              size="lg"
              color={sentimentScore >= 60 ? "green" : sentimentScore >= 40 ? "yellow" : "red"}
              variant="light"
            >
              {sentimentScore}% positive
            </Badge>
          )}
        </Group>
      </Paper>

      {isLoading ? (
        <Stack gap="md">
          <SimpleGrid cols={3} spacing="md">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} h={80} radius="md" />)}
          </SimpleGrid>
          <Skeleton h={280} radius="md" />
        </Stack>
      ) : data ? (
        <>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            {[
              { label: "Positive", value: latestPositive, color: "green" },
              { label: "Neutral", value: latestNeutral, color: "gray" },
              { label: "Negative", value: latestNegative, color: "red" },
            ].map(({ label, value, color }) => (
              <Paper key={label} withBorder radius="md" p="md">
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{label}</Text>
                  <Text size="xl" fw={700} c={color}>{value}</Text>
                  <Text size="xs" c="dimmed">mentions today</Text>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>

          <Paper withBorder radius="md" p="md">
            <Text fw={500} size="sm" mb="sm">14-Day Sentiment Trend</Text>
            <AreaChart
              h={240}
              data={data}
              dataKey="date"
              series={[
                { name: "positive", color: "green", label: "Positive" },
                { name: "neutral", color: "gray", label: "Neutral" },
                { name: "negative", color: "red", label: "Negative" },
              ]}
              type="stacked"
              curveType="natural"
            />
          </Paper>
        </>
      ) : null}
    </Stack>
  );
}
