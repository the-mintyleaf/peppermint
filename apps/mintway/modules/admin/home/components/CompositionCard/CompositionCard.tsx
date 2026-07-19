"use client";

import {
  Box,
  Group,
  RingProgress,
  Skeleton,
  Stack,
  Text,
} from "@peppermint/ui";

import { QueryErrorState } from "@/components/QueryErrorState";

import type { CompositionCardProps } from "./CompositionCard.types";

export function CompositionCard({
  segments,
  centerCaption,
  isLoading,
  isError,
  onRetry,
  isRetrying,
}: CompositionCardProps) {
  if (isLoading) {
    return (
      <Group gap="lg" wrap="nowrap" align="center">
        <Skeleton circle height={108} />
        <Stack gap="xs" style={{ flex: 1 }}>
          {segments.map((s) => (
            <Skeleton key={s.key} height={16} radius="sm" />
          ))}
        </Stack>
      </Group>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        message="Couldn't load engagement health."
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    );
  }

  const total = segments.reduce((sum, s) => sum + s.count, 0);

  if (total === 0) {
    return (
      <Text size="sm" c="dimmed" py="xs">
        No engaged applicants yet. Health will appear here as records progress.
      </Text>
    );
  }

  const sections = segments
    .filter((s) => s.count > 0)
    .map((s) => ({ value: (s.count / total) * 100, color: s.color }));

  return (
    <Group gap="lg" wrap="nowrap" align="center">
      <RingProgress
        size={108}
        thickness={12}
        roundCaps
        sections={sections}
        label={
          <Stack gap={0} align="center">
            <Text fz={24} fw={700} lh={1}>
              {total}
            </Text>
            <Text size="xs" c="dimmed" lh={1}>
              {centerCaption}
            </Text>
          </Stack>
        }
      />
      <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
        {segments.map((s) => {
          const pct = Math.round((s.count / total) * 100);
          return (
            <Group key={s.key} gap="xs" wrap="nowrap" align="center">
              <Box
                w={10}
                h={10}
                style={{
                  borderRadius: 3,
                  backgroundColor: `var(--mantine-color-${s.color}-filled)`,
                  flexShrink: 0,
                }}
              />
              <Text size="sm" fw={500} truncate style={{ flex: 1 }}>
                {s.label}
              </Text>
              <Text size="sm" fw={600}>
                {s.count}
              </Text>
              <Text size="xs" c="dimmed" w={36} ta="right">
                {pct}%
              </Text>
            </Group>
          );
        })}
      </Stack>
    </Group>
  );
}
