"use client";

import { SimpleGrid, Paper, Stack, Text, Group, Badge } from "@zetsel/ui";
import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";
import { TrendDownIcon } from "@phosphor-icons/react/dist/csr/TrendDown";
import type { StatCardsProps } from "./StatCards.types";

export function StatCards({ summary }: StatCardsProps) {
  const cards = [
    {
      label: "Content Generated",
      value: summary.contentGenerated,
      delta: summary.contentGeneratedDelta,
      unit: "items",
    },
    {
      label: "Active Automations",
      value: summary.activeAutomations,
      delta: null,
      unit: "active",
    },
    {
      label: "Total Runs",
      value: summary.totalRuns,
      delta: null,
      unit: "runs",
    },
    {
      label: "Success Rate",
      value: `${summary.successRate}%`,
      delta: null,
      unit: null,
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
      {cards.map((card) => (
        <Paper key={card.label} withBorder p="md" radius="md">
          <Stack gap={4}>
            <Text size="xs" c="dimmed" fw={500} tt="uppercase" lts={0.5}>
              {card.label}
            </Text>
            <Group align="flex-end" gap="xs">
              <Text size="xl" fw={700}>
                {card.value}
              </Text>
              {card.unit && (
                <Text size="xs" c="dimmed" mb={2}>
                  {card.unit}
                </Text>
              )}
            </Group>
            {card.delta !== null && (
              <Group gap={4}>
                {card.delta >= 0 ? (
                  <TrendUpIcon size={12} color="var(--mantine-color-green-6)" />
                ) : (
                  <TrendDownIcon size={12} color="var(--mantine-color-red-6)" />
                )}
                <Badge
                  size="xs"
                  color={card.delta >= 0 ? "green" : "red"}
                  variant="light"
                >
                  {card.delta >= 0 ? "+" : ""}
                  {card.delta}% vs prev period
                </Badge>
              </Group>
            )}
          </Stack>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
