"use client";

import { Divider, Group, Stack, Text } from "@peppermint/ui";
import type { FormSectionProps } from "./FormSection.types";

/**
 * Titled form section — see {@link FormSectionProps}. Renders a single leading
 * `Divider` (adjacent sections share it, so there is never a doubled rule),
 * a heading row that can carry right-aligned `actions`, an optional dimmed
 * `description`, then the fields in their own `Stack`.
 */
export function FormSection({
  title,
  actions,
  description,
  children,
}: FormSectionProps) {
  return (
    <Stack gap="md">
      <Divider />
      <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
        <Text fw={600} size="sm">
          {title}
        </Text>
        {actions}
      </Group>
      {description ? (
        <Text size="xs" c="dimmed">
          {description}
        </Text>
      ) : null}
      <Stack gap="md">{children}</Stack>
    </Stack>
  );
}
