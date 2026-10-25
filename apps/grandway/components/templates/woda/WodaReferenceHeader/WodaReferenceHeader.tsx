"use client";

import { Group, Stack, Text } from "@peppermint/ui";
import { wodaTextProps } from "../wodaProps";
import { isWodaLineShown } from "./WodaReferenceHeader.utils";
import type { WodaReferenceHeaderProps } from "./WodaReferenceHeader.types";

/**
 * The reference and dispatch lines under a WODA letterhead. Each prints only when
 * its switch is on, and there is no date line or rule — the ward office stamps
 * those. With both switches off the header prints nothing.
 */
export function WodaReferenceHeader({ values }: WodaReferenceHeaderProps) {
  const lines = [
    { label: "Ref. No.:", show: "show_refno", value: "wodadoc_refno" },
    { label: "Dispatch No.:", show: "show_dispatch_no", value: "dispatch_no" },
  ].filter((line) => isWodaLineShown(values, line.show, line.value));

  if (lines.length === 0) return null;

  return (
    <Stack gap="2px" mb="xl">
      {lines.map((line) => (
        <Group key={line.value} gap="4px">
          <Text {...wodaTextProps} fw={600}>
            {line.label}
          </Text>
          <Text {...wodaTextProps}>{String(values?.[line.value] ?? "")}</Text>
        </Group>
      ))}
    </Stack>
  );
}
