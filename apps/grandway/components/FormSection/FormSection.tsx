"use client";

import { useId } from "react";
import { Divider, Group, Stack, Text } from "@peppermint/ui";
import type { FormSectionProps } from "./FormSection.types";

/**
 * Titled form section — see {@link FormSectionProps}. Renders a single leading
 * `Divider` (adjacent sections share it, so there is never a doubled rule),
 * a heading row that can carry right-aligned `actions`, an optional dimmed
 * `description`, then the fields in their own `Stack`.
 *
 * The outer wrapper is a `role="group"` labelled by the heading via
 * `aria-labelledby`, so assistive tech still announces the section boundary and
 * name it used to get from `<fieldset><legend>` — without the bordered look.
 */
export function FormSection({
  title,
  actions,
  description,
  children,
}: FormSectionProps) {
  const titleId = useId();

  return (
    <Stack gap="md" role="group" aria-labelledby={titleId}>
      <Divider />
      <Group justify="space-between" align="center" gap="sm">
        <Text id={titleId} fw={600} size="sm">
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
