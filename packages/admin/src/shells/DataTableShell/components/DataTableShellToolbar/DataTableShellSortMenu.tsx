'use client';

import { useState } from 'react';
import { ActionIcon, Badge, Button, Stack, Text, TextInput, Tooltip } from '@peppermint/ui';
import { ArrowsDownUpIcon } from '@phosphor-icons/react/dist/csr/ArrowsDownUp';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import { useTableStore } from '../../../../wrappers/DataTableWrapper';
import type { DataTableShellColumn } from '../../DataTableShell.types';
import { ToolbarIconButton } from './ToolbarIconButton';
import { getColumnKey, getColumnLabel } from './toolbar.utils';

interface DataTableShellSortMenuProps<T extends Record<string, unknown>> {
  columns: DataTableShellColumn<T>[];
}

export function DataTableShellSortMenu<T extends Record<string, unknown>>({
  columns,
}: DataTableShellSortMenuProps<T>) {
  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState('');

  const useTable = useTableStore();
  const sort = useTable((s) => s.sort);
  const toggleSort = useTable((s) => s.toggleSort);
  const setSort = useTable((s) => s.setSort);

  const sortableColumns = columns.filter((col) => col.sortable);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredColumns = sortableColumns.filter((col) =>
    getColumnLabel(col).toLowerCase().includes(normalizedQuery),
  );

  const getSortState = (key: string) => sort.find((s) => s.field === key);

  const handleClose = () => {
    setOpened(false);
    setQuery('');
  };

  if (sortableColumns.length === 0) {
    return (
      <Tooltip label="Sort" withArrow position="bottom">
        <ActionIcon variant="subtle" color="gray" size="md" aria-label="Sort" disabled>
          <ArrowsDownUpIcon size={18} />
        </ActionIcon>
      </Tooltip>
    );
  }

  return (
    <ToolbarIconButton
      label="Sort"
      icon={<ArrowsDownUpIcon size={18} />}
      opened={opened}
      onToggle={() => setOpened((v) => !v)}
      onClose={handleClose}
      width={280}
    >
      <Stack gap="xs">
        <TextInput
          size="xs"
          placeholder="Sort by"
          leftSection={<MagnifyingGlassIcon size={14} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
        <Stack gap={0} mah={240} style={{ overflowY: 'auto' }}>
          {filteredColumns.map((col) => {
            const key = getColumnKey(col);
            const label = getColumnLabel(col);
            const state = getSortState(key);
            const sortIndex = sort.findIndex((s) => s.field === key);

            return (
              <Button
                key={key}
                justify="space-between"
                variant={state ? 'light' : 'subtle'}
                size="xs"
                radius="sm"
                onClick={() => toggleSort(key)}
                rightSection={
                  state ? (
                    <Badge size="xs" variant="light">
                      {sortIndex === 0 ? '1' : String(sortIndex + 1)}{' '}
                      {state.direction === 'asc' ? '↑' : '↓'}
                    </Badge>
                  ) : null
                }
              >
                {label}
              </Button>
            );
          })}
          {filteredColumns.length === 0 && (
            <Text size="xs" c="dimmed" ta="center" py="sm">
              No columns match
            </Text>
          )}
        </Stack>
        {sort.length > 0 && (
          <Button size="xs" variant="subtle" onClick={() => setSort([])}>
            Clear sort
          </Button>
        )}
      </Stack>
    </ToolbarIconButton>
  );
}
