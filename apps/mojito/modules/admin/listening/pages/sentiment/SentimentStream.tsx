"use client";

import { Stack, Group, Title, Text, Paper, Skeleton, Badge, SimpleGrid } from "@zetsel/ui";
import { AreaChart } from "@zetsel/ui";
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
            <Title order={3}>Sentiment Analysis</Title>
            <Text c="dimmed" size="sm">Real-time sentiment breakdown of brand mentions</Text>
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
        <>
          <SimpleGrid cols={3} spacing="md">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} h={80} radius="md" />)}
          </SimpleGrid>
          <Skeleton h={280} radius="md" />
        </>
      ) : data ? (
        <>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            <Paper withBorder radius="md" p="md">
              <Stack gap={4}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Positive</Text>
                <Text size="xl" fw={700} c="green">{latestPositive}</Text>
                <Text size="xs" c="dimmed">mentions today</Text>
              </Stack>
            </Paper>
            <Paper withBorder radius="md" p="md">
              <Stack gap={4}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Neutral</Text>
                <Text size="xl" fw={700} c="gray">{latestNeutral}</Text>
                <Text size="xs" c="dimmed">mentions today</Text>
              </Stack>
            </Paper>
            <Paper withBorder radius="md" p="md">
              <Stack gap={4}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Negative</Text>
                <Text size="xl" fw={700} c="red">{latestNegative}</Text>
                <Text size="xs" c="dimmed">mentions today</Text>
              </Stack>
            </Paper>
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
