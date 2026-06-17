'use client';

import { Center, Stack, Text } from '@peppermint/ui';
import { SmileyNervousIcon } from '@phosphor-icons/react/dist/csr/SmileyNervous';

export function DataTableShellEmptyState() {
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
