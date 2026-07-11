"use client";

import { ActionIcon, Group, Stack, Title } from "@peppermint/ui";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import type { SettingsSubScreenProps } from "./SettingsSubScreen.types";

export function SettingsSubScreen({
  title,
  onBack,
  children,
}: SettingsSubScreenProps) {
  return (
    <Stack gap="md">
      <Group gap="xs" wrap="nowrap">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={onBack}
          aria-label="Back"
        >
          <ArrowLeftIcon size={16} aria-hidden />
        </ActionIcon>
        <Title order={4} size="xs">
          {title}
        </Title>
      </Group>
      {children}
    </Stack>
  );
}
