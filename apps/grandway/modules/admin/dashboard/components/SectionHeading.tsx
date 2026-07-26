"use client";

import { Group, Stack, Text } from "@peppermint/ui";
import type { SectionHeadingProps } from "./SectionHeading.types";

/**
 * The band that introduces each dashboard section — a title plus a one-line
 * "how to read this" subtitle (the contract caveats the old per-section headings
 * carried: "counts are zero-filled", "two windows — do not sum", …). The `id`
 * anchors the section so the alert strip can jump straight to it.
 */
export function SectionHeading({
  title,
  subtitle,
  right,
  id,
}: SectionHeadingProps) {
  return (
    <Group justify="space-between" align="flex-end" id={id} wrap="nowrap">
      <Stack gap={2}>
        <Text fw={600} size="sm" style={{ letterSpacing: "-0.01em" }}>
          {title}
        </Text>
        {subtitle ? (
          <Text size="xs" c="dimmed">
            {subtitle}
          </Text>
        ) : null}
      </Stack>
      {right ? <div style={{ flex: "none" }}>{right}</div> : null}
    </Group>
  );
}
