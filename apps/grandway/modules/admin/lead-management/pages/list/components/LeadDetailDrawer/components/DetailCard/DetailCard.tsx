"use client";

import { Group, Paper, Stack, Text, ThemeIcon } from "@peppermint/ui";
import type { DetailCardProps } from "./DetailCard.types";

/**
 * One grouped section of the lead profile — a labelled, contained card. Cards
 * carry a single concept each (contact, source, study interest, lifecycle) so
 * the border earns its place as a grouping boundary, not decoration.
 */
export function DetailCard({ title, icon, action, children }: DetailCardProps) {
  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Group gap="xs" wrap="nowrap">
            <ThemeIcon variant="light" color="gray" size="sm" radius="sm">
              {icon}
            </ThemeIcon>
            <Text component="h3" size="sm" fw={600}>
              {title}
            </Text>
          </Group>
          {action}
        </Group>
        <Stack gap="xs">{children}</Stack>
      </Stack>
    </Paper>
  );
}
