'use client';

import { Button, Group, Text } from '@peppermint/ui';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import { useTableStore } from '../../../../wrappers/DataTableWrapper';

export function DataTableShellActiveFilters() {
  const useTable = useTableStore();
  const filters = useTable((s) => s.filters);
  const setFilters = useTable((s) => s.setFilters);

  const entries = Object.entries(filters);

  if (entries.length === 0) return null;

  const removeFilter = (key: string) => {
    const next = { ...filters };
    delete next[key];
    setFilters(next);
  };

  const getLabel = (value: unknown): string => {
    if (value !== null && typeof value === 'object' && 'label' in value) {
      return String((value as Record<string, unknown>).label);
    }
    return String(value);
  };

  return (
    <Group gap={4} px="sm" py={6} wrap="wrap">
      <Text size="xs" c="dimmed" mr={4}>
        Filters:
      </Text>
      {entries.map(([key, value]) => (
        <Button
          key={key}
          variant="light"
          size="compact-xs"
          rightSection={
            <XIcon
              size={10}
              weight="bold"
              aria-label={`Remove ${key} filter`}
              style={{ cursor: 'pointer' }}
              onClick={() => removeFilter(key)}
            />
          }
        >
          {key}: {getLabel(value)}
        </Button>
      ))}
    </Group>
  );
}
