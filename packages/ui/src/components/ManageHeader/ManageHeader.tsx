"use client";

import { Group, Stack, Text } from "@mantine/core";
import type { ManageHeaderProps } from "./ManageHeader.types";

export function ManageHeader({
  title,
  count,
  description,
  visibleFrom = "lg",
}: ManageHeaderProps) {
  return (
    <Stack gap={8} visibleFrom={visibleFrom} py="lg">
      <Group align="center" gap="xs">
        <Text size="1.6rem" fw={600}>
          {title}
        </Text>
        {count != null && (
          <Text size="1.5rem" fw={400} opacity={0.3}>
            {count}
          </Text>
        )}
      </Group>
      {description && (
        <Text size="xs" opacity={0.5}>
          {description}
        </Text>
      )}
    </Stack>
  );
}
