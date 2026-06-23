"use client";

import { Badge, Box, Button, Group, Stack, Text } from "@peppermint/ui";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { ANALYTICS_COLORS } from "../../taskAnalytics.styles";
import type { FeaturedUpcomingTaskProps } from "./FeaturedUpcomingTask.types";

function NotebookGraphic() {
  return (
    <Box
      style={{
        width: 72,
        height: 80,
        position: "relative",
        flexShrink: 0,
      }}
    >
      <Box
        style={{
          width: 56,
          height: 72,
          background: ANALYTICS_COLORS.accentPink,
          borderRadius: "8px 12px 12px 8px",
          transform: "rotate(-6deg)",
          boxShadow: "0 8px 20px rgba(232,77,138,0.4)",
          position: "absolute",
          right: 0,
          top: 4,
        }}
      />
      <Box
        style={{
          width: 48,
          height: 4,
          background: "rgba(255,255,255,0.5)",
          borderRadius: 2,
          position: "absolute",
          right: 12,
          top: 24,
        }}
      />
      <Box
        style={{
          width: 36,
          height: 4,
          background: "rgba(255,255,255,0.35)",
          borderRadius: 2,
          position: "absolute",
          right: 12,
          top: 34,
        }}
      />
    </Box>
  );
}

export function FeaturedUpcomingTask({ task }: FeaturedUpcomingTaskProps) {
  return (
    <Box
      style={{
        background: ANALYTICS_COLORS.accentYellow,
        borderRadius: 24,
        padding: 20,
        boxShadow: "0 4px 24px rgba(245,185,66,0.3)",
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap="sm" style={{ flex: 1 }}>
          <Group gap="sm">
            <Text size="xs" fw={600} c={ANALYTICS_COLORS.textDark}>
              {task.timeRange}
            </Text>
            <Badge
              size="sm"
              radius="xl"
              leftSection={<ClockIcon size={12} aria-label="Duration" />}
              styles={{
                root: {
                  background: ANALYTICS_COLORS.accentOrange,
                  color: "white",
                  textTransform: "none",
                },
              }}
            >
              {task.duration}
            </Badge>
          </Group>
          <Text fw={700} size="md" c={ANALYTICS_COLORS.textDark} lineClamp={2}>
            {task.title}
          </Text>
          <Group gap="sm" mt="xs">
            <Button
              size="xs"
              radius="xl"
              styles={{
                root: {
                  background: ANALYTICS_COLORS.accentOrange,
                  color: "white",
                  fontWeight: 600,
                },
              }}
            >
              Details
            </Button>
            <Button size="xs" variant="subtle" c={ANALYTICS_COLORS.textDark}>
              Dismiss
            </Button>
          </Group>
        </Stack>
        <NotebookGraphic />
      </Group>
    </Box>
  );
}
