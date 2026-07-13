"use client";

import { Center, Stack, Text } from "@peppermint/ui";
import { SmileyNervousIcon } from "@phosphor-icons/react/dist/csr/SmileyNervous";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";

interface DataTableShellEmptyStateProps {
  /** Render the failure variant instead of the empty variant. */
  error?: boolean;
}

export function DataTableShellEmptyState({
  error = false,
}: DataTableShellEmptyStateProps) {
  if (error) {
    return (
      <Center py="xl">
        <Stack align="center" gap="xs">
          <WarningIcon
            size={40}
            weight="duotone"
            color="var(--mantine-color-red-6)"
            aria-hidden
          />
          <Text size="sm" c="red" ta="center">
            Couldn’t load records.
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            Something went wrong. Try again in a moment.
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Center py="xl">
      <Stack align="center" gap="xs">
        <SmileyNervousIcon size={40} weight="duotone" aria-hidden />
        <Text size="sm" c="dimmed" ta="center">
          No records found.
        </Text>
        <Text size="xs" c="dimmed" ta="center">
          Try adjusting your search or filters.
        </Text>
      </Stack>
    </Center>
  );
}
