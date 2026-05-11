import React from 'react';
import { Group, ActionIcon, Tooltip, Menu } from '@zetsel/ui';
import { Trash, DotsThreeVertical, SquaresFour, Rows } from '@phosphor-icons/react';
import { useDataTableStore } from '../../../../wrappers/DataTableWrapper';

interface TableToolbarProps {
  onDeleteClick?: (ids: Array<string | number>) => void;
}

export function TableToolbar({ onDeleteClick }: TableToolbarProps) {
  const selectedIds = useDataTableStore((s) => s.selectedIds);
  const density = useDataTableStore((s) => s.density);
  const setDensity = useDataTableStore((s) => s.setDensity);
  const clearSelection = useDataTableStore((s) => s.clearSelection);

  return (
    <Group justify="flex-end" mb="xs" gap="xs">
      {selectedIds.length > 0 && (
        <Tooltip label={`Delete ${selectedIds.length} selected`}>
          <ActionIcon
            color="red"
            variant="light"
            aria-label={`Delete ${selectedIds.length} selected rows`}
            onClick={() => {
              onDeleteClick?.(selectedIds);
              clearSelection();
            }}
          >
            <Trash size={16} />
          </ActionIcon>
        </Tooltip>
      )}
      <Menu shadow="md" width={160}>
        <Menu.Target>
          <ActionIcon variant="subtle" aria-label="Table options">
            <DotsThreeVertical size={18} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Density</Menu.Label>
          <Menu.Item
            leftSection={<SquaresFour size={14} />}
            onClick={() => setDensity('compact')}
            fw={density === 'compact' ? 700 : undefined}
          >
            Compact
          </Menu.Item>
          <Menu.Item
            leftSection={<Rows size={14} />}
            onClick={() => setDensity('normal')}
            fw={density === 'normal' ? 700 : undefined}
          >
            Normal
          </Menu.Item>
          <Menu.Item
            leftSection={<Rows size={14} />}
            onClick={() => setDensity('spacious')}
            fw={density === 'spacious' ? 700 : undefined}
          >
            Spacious
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
