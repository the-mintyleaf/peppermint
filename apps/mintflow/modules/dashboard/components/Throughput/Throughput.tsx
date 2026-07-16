"use client";

import { Box, Group, Stack } from "@peppermint/ui";

import { tokens } from "@/config/design";
import { MonoText } from "@/components";

import { barColor, dark } from "../../Dashboard.utils";
import type { ThroughputProps } from "./Throughput.types";

const MOBILE_PLOT_PX = 96;

/**
 * Pure-CSS flex-bar throughput chart (no chart library). The peak bar is accent;
 * desktop also prints each bar's count above it. Static mock — no async states.
 */
export function Throughput({
  bars,
  periodLabel,
  variant,
  style,
}: ThroughputProps) {
  const max = Math.max(...bars.map((b) => b.value));
  const isDesktop = variant === "desktop";

  return (
    <Stack
      gap={0}
      p={18}
      style={{
        background: dark.tile,
        borderRadius: 20,
        minWidth: 0,
        ...style,
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <MonoText label fz={10} c={dark.label}>
          THROUGHPUT
        </MonoText>
        <MonoText fz={10} c={dark.faint}>
          {periodLabel}
        </MonoText>
      </Group>

      <Group
        gap={isDesktop ? 14 : 10}
        align="flex-end"
        wrap="nowrap"
        mt={16}
        style={{ flex: isDesktop ? 1 : undefined }}
      >
        {bars.map((bar, i) => {
          const isPeak = bar.value === max;
          const color = barColor(isPeak, variant);
          return (
            <Stack
              key={`${bar.label}-${i}`}
              gap={6}
              align="center"
              style={{ flex: 1, minWidth: 0, height: "100%" }}
            >
              {isDesktop && (
                <MonoText
                  fz={11}
                  fw={600}
                  c={isPeak ? tokens.accent : dark.faint}
                >
                  {bar.count}
                </MonoText>
              )}
              <Box
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  flex: isDesktop ? 1 : undefined,
                  height: isDesktop ? undefined : MOBILE_PLOT_PX,
                }}
              >
                <Box
                  style={{
                    width: "100%",
                    height: isDesktop
                      ? `${bar.value * 100}%`
                      : bar.value * MOBILE_PLOT_PX,
                    minHeight: 4,
                    borderRadius: 5,
                    background: color,
                  }}
                />
              </Box>
              <MonoText fz={9} c={dark.faint} ta="center">
                {bar.label}
              </MonoText>
            </Stack>
          );
        })}
      </Group>
    </Stack>
  );
}
