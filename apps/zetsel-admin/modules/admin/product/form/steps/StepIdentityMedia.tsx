"use client";

import { Divider, Stack, Text } from "@zetsel/ui";
import { StepIdentity } from "./StepIdentity";
import { StepMedia } from "./StepMedia";

export function StepIdentityMedia() {
  return (
    <Stack gap="xl">
      <StepIdentity />

      <Divider
        label={
          <Text size="xs" fw={600} c="dimmed">
            Media
          </Text>
        }
        labelPosition="left"
      />

      <StepMedia />
    </Stack>
  );
}
