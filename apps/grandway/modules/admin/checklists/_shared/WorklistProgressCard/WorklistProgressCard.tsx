"use client";

import {
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@peppermint/ui";
import type { WorklistProgressCardProps } from "./WorklistProgressCard.types";

/**
 * One measure: what it counts, how many of them are done, and how many are
 * not. The fraction is the figure — a percentage alone hides whether "80%" is
 * four of five or forty of fifty, which is the difference between a morning's
 * work and a week's.
 */
function Measure({
  label,
  resolved,
  total,
  color,
}: {
  label: string;
  resolved: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((resolved / total) * 100) : 100;
  const left = Math.max(total - resolved, 0);
  const done = total > 0 && left === 0;

  return (
    <Stack gap={6}>
      <Text size="xs" fw={700} tt="uppercase" c="dimmed">
        {label}
      </Text>
      <Group align="baseline" gap={6} wrap="nowrap">
        <Title order={3}>
          {resolved}/{total}
        </Title>
        <Text size="xs" c="dimmed">
          {pct}%
        </Text>
      </Group>
      <Progress value={pct} size="sm" color={done ? "green" : color} />
      <Text size="xs" c="dimmed">
        {total === 0
          ? "Nothing on this list"
          : done
            ? "All done"
            : `${left} left`}
      </Text>
    </Stack>
  );
}

/**
 * The worklist's two numbers, side by side in one card: how much of the list
 * is done, and how much of the part that actually gates completion is done.
 * They belong together — required progress is only readable against the whole
 * — and they are the same card on the worklist page and in the drawer, so the
 * figure an operator learns to read does not move between surfaces.
 */
export function WorklistProgressCard({
  progress,
  title = "Journey progress overview",
}: WorklistProgressCardProps) {
  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="sm">
        <Title order={5}>{title}</Title>

        <SimpleGrid cols={2} spacing="lg">
          <Measure
            label="Overall"
            resolved={progress.resolved}
            total={progress.total}
            color="blue"
          />
          <Measure
            label="Required"
            resolved={progress.required_resolved}
            total={progress.required_total}
            color="orange"
          />
        </SimpleGrid>

        {progress.blocked > 0 ? (
          // Blocked is not a resolution — it is the count that keeps the
          // checklist from completing, so it reads as a warning, not a stat.
          <Text size="xs" c="red">
            {progress.blocked}{" "}
            {progress.blocked === 1 ? "item is" : "items are"} blocked — still
            outstanding
          </Text>
        ) : null}
      </Stack>
    </Paper>
  );
}
