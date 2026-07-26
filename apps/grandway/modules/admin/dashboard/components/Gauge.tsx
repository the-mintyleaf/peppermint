"use client";

import { Stack, Text } from "@peppermint/ui";
import { formatRatePercent } from "../dashboard.utils";
import type { GaugeProps } from "./Gauge.types";

// Semicircle arc length for r=50 (π·r ≈ 157) — the value arc's dash length is
// `percent/100 · ARC`.
const ARC_LENGTH = 157;

/**
 * A flat half-circle gauge for one conversion rate. The rate is the anchor of
 * its cell, so the filled arc uses the brand accent; a null percent (denominator
 * was 0) shows an empty track and "—", never a misleading 0%. The number is the
 * signal — the arc is a secondary, at-a-glance cue.
 */
export function Gauge({ percent, label, caption }: GaugeProps) {
  const clamped = percent === null ? 0 : Math.max(0, Math.min(100, percent));
  const dash = (clamped / 100) * ARC_LENGTH;

  return (
    <Stack gap={2} align="center">
      <div style={{ position: "relative", width: 118, height: 66 }}>
        <svg
          viewBox="0 0 120 66"
          style={{ width: 118, height: 66, display: "block" }}
          role="img"
          aria-label={`${label}: ${formatRatePercent(percent)}`}
        >
          <path
            d="M10 60 A50 50 0 0 1 110 60"
            fill="none"
            stroke="var(--mantine-color-gray-2)"
            strokeWidth={9}
            strokeLinecap="round"
          />
          {percent !== null ? (
            <path
              d="M10 60 A50 50 0 0 1 110 60"
              fill="none"
              stroke="var(--mantine-color-brand-6)"
              strokeWidth={9}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${ARC_LENGTH}`}
            />
          ) : null}
        </svg>
        <Text
          fw={700}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 2,
            textAlign: "center",
          }}
        >
          {formatRatePercent(percent)}
        </Text>
      </div>
      <Text size="xs" ta="center">
        {label}
      </Text>
      <Text size="xs" c="dimmed" ff="monospace">
        {caption}
      </Text>
    </Stack>
  );
}
