"use client";

import { Badge, Box, Group, Stack, Text } from "@peppermint/ui";

import type { CapabilityGridProps } from "../../Home.types";

/**
 * What is actually built versus what is only scaffolded. Status is carried by
 * the word first — the color is a second signal, never the only one — so
 * "placeholder" can't be mistaken for a working route.
 */
export function CapabilityGrid({ items }: CapabilityGridProps) {
  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 12,
      }}
    >
      {items.map((item) => (
        <Stack
          key={item.id}
          gap={6}
          p={14}
          style={{ border: "var(--ml-rule-solid)" }}
        >
          <Group justify="space-between" wrap="nowrap" align="flex-start">
            <Text fz="13px" fw={700}>
              {item.label}
            </Text>
            <Badge
              size="xs"
              radius={0}
              variant="outline"
              color={item.status === "ready" ? "teal" : "gray"}
            >
              {item.status === "ready" ? "Ready" : "Placeholder"}
            </Badge>
          </Group>
          <Text fz="12px" c="dimmed">
            {item.detail}
          </Text>
        </Stack>
      ))}
    </Box>
  );
}
