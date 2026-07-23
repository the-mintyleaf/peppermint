import { Stack, Text, Title } from "@peppermint/ui";
import type { SettingsHeaderProps } from "./SettingsHeader.types";

export function SettingsHeader({ title, description }: SettingsHeaderProps) {
  return (
    <Stack gap={2}>
      <Title order={4} size="xs">
        {title}
      </Title>
      <Text size="xs" c="dimmed">
        {description}
      </Text>
    </Stack>
  );
}
