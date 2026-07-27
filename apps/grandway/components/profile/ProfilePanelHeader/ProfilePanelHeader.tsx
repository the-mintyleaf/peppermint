"use client";

import { Badge, Divider, Group, Stack, Text } from "@peppermint/ui";
import type { ProfilePanelHeaderProps } from "./ProfilePanelHeader.types";

/**
 * The anchor at the top of a tab panel. Every panel gets one, so a tab always
 * announces what it holds instead of relying on the tab strip — which scrolls
 * out of mind the moment the operator starts reading.
 *
 * This is the level above `ProfileSection`: panel title (`sm`/700, sentence
 * case) → section label (`xs`/700 uppercase dimmed) → field. The trailing
 * `action` slot carries the panel's levers; the `count` badge next to the title
 * is a fact and deliberately looks nothing like them.
 */
export function ProfilePanelHeader({
  title,
  description,
  count,
  action,
}: ProfilePanelHeaderProps) {
  return (
    <Stack gap="xs">
      <Group justify="space-between" align="flex-end" wrap="nowrap" gap="md">
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Group gap="xs" wrap="nowrap">
            <Text component="h2" size="sm" fw={700}>
              {title}
            </Text>
            {count !== undefined ? (
              <Badge size="xs" variant="light" color="gray">
                {count}
              </Badge>
            ) : null}
          </Group>
          {description ? (
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          ) : null}
        </Stack>
        {action ? (
          <Group gap="xs" wrap="nowrap">
            {action}
          </Group>
        ) : null}
      </Group>
      <Divider />
    </Stack>
  );
}
