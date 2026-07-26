"use client";

import { Group, Text } from "@peppermint/ui";
import type { DetailFieldProps } from "./DetailField.types";

/**
 * A single label/value row inside a `DetailCard`. Label left and dimmed, value
 * right and emphasised — a fact, never an action. Strings render as `Text`;
 * a passed node (badge, link) renders as-is.
 */
export function DetailField({ label, value }: DetailFieldProps) {
  const isEmpty = value === null || value === undefined || value === "";
  const isText = typeof value === "string" || typeof value === "number";

  return (
    <Group justify="space-between" wrap="nowrap" gap="md" align="flex-start">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      {isEmpty ? (
        <Text size="sm" ta="right" c="dimmed">
          —
        </Text>
      ) : isText ? (
        <Text size="sm" ta="right" fw={500}>
          {value}
        </Text>
      ) : (
        value
      )}
    </Group>
  );
}
