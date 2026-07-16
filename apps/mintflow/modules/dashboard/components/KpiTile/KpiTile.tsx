"use client";

import { Box, Group, Stack } from "@peppermint/ui";

import { tokens } from "@/config/design";
import { MonoText } from "@/components";

import { dark } from "../../Dashboard.utils";
import type { KpiTileProps } from "./KpiTile.types";

/** A single dark KPI tile: mono label, big metric, and a caption/trend footer. */
export function KpiTile({
  label,
  value,
  unit,
  valueColor = dark.text,
  valueSize = 38,
  headerDot = false,
  footer,
  style,
}: KpiTileProps) {
  return (
    <Stack
      gap={0}
      justify="space-between"
      p={18}
      style={{
        background: dark.tile,
        borderRadius: 20,
        minWidth: 0,
        ...style,
      }}
    >
      <Group gap={7} align="center" wrap="nowrap">
        <MonoText label fz={10} c={dark.label}>
          {label}
        </MonoText>
        {headerDot && (
          <Box
            w={8}
            h={8}
            style={{ borderRadius: "50%", background: tokens.accent }}
          />
        )}
      </Group>

      <Group gap={4} align="baseline" wrap="nowrap" mt={16}>
        <MonoText
          fz={valueSize}
          fw={700}
          c={valueColor}
          lh={1}
          style={{ letterSpacing: "-1.5px" }}
        >
          {value}
        </MonoText>
        {unit && (
          <MonoText fz={13} fw={500} c={dark.muted}>
            {unit}
          </MonoText>
        )}
      </Group>

      {footer != null && <Box mt={12}>{footer}</Box>}
    </Stack>
  );
}
