"use client";

import { Divider, Stack, Text } from "@peppermint/ui";
import type { DetailSectionProps } from "./DetailSection.types";

/**
 * A labelled band of related pairs. The divider label is the section's own
 * quiet anchor — enough to group the pairs beneath it without competing with
 * the lead's name above.
 */
export function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <Stack gap="xs">
      <Divider
        label={
          <Text size="xs" fw={700} tt="uppercase" c="dimmed">
            {title}
          </Text>
        }
        labelPosition="left"
      />
      <Stack gap={6}>{children}</Stack>
    </Stack>
  );
}
