"use client";

import { Group, Stack, Text } from "@peppermint/ui";
import type { ProfileSectionProps } from "./ProfileSection.types";

/**
 * A titled block within tab content — an uppercase, tracked label makes each
 * section a clear boundary without a heavy border. The `action` slot carries
 * the section's own control (search, add, count), kept on the header line so
 * the body below stays a clean list of cards or fields.
 */
export function ProfileSection({
  title,
  description,
  action,
  children,
}: ProfileSectionProps) {
  return (
    <Stack gap="sm">
      <Group justify="space-between" align="flex-end" wrap="nowrap" gap="md">
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Text
            component="h3"
            size="xs"
            fw={700}
            tt="uppercase"
            c="dimmed"
            style={{ letterSpacing: "0.04em" }}
          >
            {title}
          </Text>
          {description ? (
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          ) : null}
        </Stack>
        {action ? <Group gap="xs">{action}</Group> : null}
      </Group>
      {children}
    </Stack>
  );
}
