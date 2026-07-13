"use client";

import { useState } from "react";
import { Box, Group, Stack, Text } from "@peppermint/ui";
import { BarChart } from "@peppermint/ui/charts";
import { ChartBarIcon } from "@phosphor-icons/react/dist/csr/ChartBar";
import { ANALYTICS_COLORS, darkCardStyle } from "../../taskAnalytics.styles";
import type { WeeklyProductivityProps } from "./WeeklyProductivity.types";

export function WeeklyProductivity({
  data,
  taskCount,
}: WeeklyProductivityProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>("Thu");

  const hoveredData = data.find((d) => d.day === hoveredDay);

  return (
    <Box style={darkCardStyle()}>
      <Group justify="space-between" mb="xs">
        <Group gap="sm">
          <ChartBarIcon
            size={18}
            color={ANALYTICS_COLORS.accentOrange}
            aria-label="Chart"
          />
          <Text c={ANALYTICS_COLORS.textPrimary} fw={700} size="md">
            Weekly Productivity Overview
          </Text>
        </Group>
      </Group>
      <Text c={ANALYTICS_COLORS.textMuted} size="xs" mb="lg">
        Selected Period: {taskCount} Task
      </Text>

      <Box style={{ position: "relative" }}>
        <BarChart
          h={180}
          data={data}
          dataKey="day"
          series={[
            {
              name: "hours",
              color: ANALYTICS_COLORS.accentOrange,
              label: "Hours",
            },
          ]}
          tickLine="none"
          gridAxis="y"
          withXAxis
          withYAxis
          yAxisProps={{
            domain: [8, 20],
            tickFormatter: (v: number) => `${v}hr`,
          }}
          barProps={{ radius: 8 }}
          styles={{
            axis: { stroke: "rgba(244,245,240,0.15)" },
            bar: hoveredDay
              ? {
                  "&:nth-of-type(4)": {
                    fill: `repeating-linear-gradient(45deg, ${ANALYTICS_COLORS.accentOrange}, ${ANALYTICS_COLORS.accentOrange} 4px, #ff8c42 4px, #ff8c42 8px)`,
                  },
                }
              : undefined,
          }}
          onMouseLeave={() => setHoveredDay("Thu")}
        />

        {hoveredData && (
          <Box
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              background: "rgba(0,0,0,0.85)",
              borderRadius: 12,
              padding: "10px 14px",
              border: `1px solid ${ANALYTICS_COLORS.accentOrange}`,
            }}
          >
            <Stack gap={4}>
              <Text size="xs" c={ANALYTICS_COLORS.textPrimary} fw={600}>
                On this day: {Math.floor(hoveredData.hours)}hr{" "}
                {Math.round((hoveredData.hours % 1) * 60)}min
              </Text>
              <Text size="10px" c={ANALYTICS_COLORS.textMuted}>
                Assigned Task: {hoveredData.assigned}
              </Text>
              <Text size="10px" c={ANALYTICS_COLORS.textMuted}>
                Completed Task: {hoveredData.completed}
              </Text>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}
