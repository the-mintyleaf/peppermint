import { Group, Stack, Text } from "@peppermint/ui";
import type { SettingsRowProps } from "./SettingsRow.types";

export function SettingsRow({ label, description, right }: SettingsRowProps) {
  return (
    <Group justify="space-between" align="center" wrap="nowrap" gap="md">
      <Stack gap={2} style={{ minWidth: 0 }}>
        <Text size="xs" fw={500}>
          {label}
        </Text>
        {description ? (
          <Text size="xs" c="dimmed">
            {description}
          </Text>
        ) : null}
      </Stack>
      {right ? <div style={{ flexShrink: 0 }}>{right}</div> : null}
    </Group>
  );
}
