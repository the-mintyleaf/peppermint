"use client";

import { DonutChart } from "@zetsel/ui";
import { Group, Stack, Text } from "@zetsel/ui";
import type { PlatformShare } from "../../Analytics.types";

interface PlatformDonutChartProps {
  byPlatform: PlatformShare[];
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "violet.6",
  twitter: "blue.6",
  linkedin: "indigo.6",
  tiktok: "red.6",
};

export function PlatformDonutChart({ byPlatform }: PlatformDonutChartProps) {
  const total = byPlatform.reduce((sum, p) => sum + p.count, 0);
  const data = byPlatform.map((p) => ({
    name: p.platform,
    value: p.count,
    color: PLATFORM_COLORS[p.platform] ?? "gray.6",
  }));

  return (
    <Group align="center" gap="xl">
      <DonutChart data={data} size={180} thickness={30} withTooltip />
      <Stack gap="xs">
        {data.map((item) => (
          <Group key={item.name} gap="xs">
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: `var(--mantine-color-${item.color.replace(".", "-")})`,
                flexShrink: 0,
              }}
            />
            <Text size="xs" tt="capitalize">
              {item.name}
            </Text>
            <Text size="xs" c="dimmed">
              {item.value} ({Math.round((item.value / total) * 100)}%)
            </Text>
          </Group>
        ))}
      </Stack>
    </Group>
  );
}
