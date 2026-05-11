import React from 'react';
import { Table, Checkbox, ActionIcon, Group, Skeleton, Text } from '@zetsel/ui';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { useDataTableContext, useDataTableStore } from '../../../../wrappers/DataTableWrapper';
import type { ColumnDef, ActionDef, RowExpansionDef } from '../../DataTableShell.types';

interface TableBodyProps<T> {
  columns: ColumnDef<T>[];
  idAccessor: keyof T & string;
  onEditClick?: (id: string | number, row: T) => void;
  onDeleteClick?: (ids: Array<string | number>) => void;
  rowExpansion?: RowExpansionDef<T>;
  density?: 'compact' | 'normal' | 'spacious';
}

const DENSITY_PY: Record<string, string> = {
  compact: '4px',
  normal: '8px',
  spacious: '14px',
};

export function TableBody<T = unknown>({
  columns,
  idAccessor,
  onEditClick,
  onDeleteClick,
  rowExpansion,
}: TableBodyProps<T>) {
  const { rows, isLoading } = useDataTableContext<T>();
  const selectedIds = useDataTableStore((s) => s.selectedIds);
  const toggleRow = useDataTableStore((s) => s.toggleRow);
  const selectAll = useDataTableStore((s) => s.selectAll);
  const clearSelection = useDataTableStore((s) => s.clearSelection);
  const density = useDataTableStore((s) => s.density);

  const py = DENSITY_PY[density] ?? DENSITY_PY.normal;
  const hasActions = !!(onEditClick || onDeleteClick);
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r[idAccessor] as string | number));

  function handleSelectAll() {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(rows.map((r) => r[idAccessor] as string | number));
    }
  }

  if (isLoading) {
    return (
      <Table>
        <Table.Thead>
          <Table.Tr>
            {columns.map((col) => (
              <Table.Th key={col.key}>{col.label}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <Table.Tr key={i}>
              {columns.map((col) => (
                <Table.Td key={col.key}><Skeleton height={16} /></Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    );
  }

  if (rows.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">No records found.</Text>
    );
  }

  return (
    <Table highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th style={{ width: 40 }}>
            <Checkbox
              checked={allSelected}
              indeterminate={selectedIds.length > 0 && !allSelected}
              onChange={handleSelectAll}
              aria-label="Select all rows"
            />
          </Table.Th>
          {columns.map((col) => (
            <Table.Th key={col.key}>{col.label}</Table.Th>
          ))}
          {hasActions && <Table.Th style={{ width: 80 }}>Actions</Table.Th>}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => {
          const id = row[idAccessor] as string | number;
          const isSelected = selectedIds.includes(id);
          return (
            <React.Fragment key={String(id)}>
              <Table.Tr bg={isSelected ? 'var(--mantine-color-blue-light)' : undefined}>
                <Table.Td style={{ paddingTop: py, paddingBottom: py }}>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleRow(id)}
                    aria-label={`Select row ${String(id)}`}
                  />
                </Table.Td>
                {columns.map((col) => (
                  <Table.Td key={col.key} style={{ paddingTop: py, paddingBottom: py }}>
                    {col.render
                      ? col.render(row[col.key as keyof T], row)
                      : String(row[col.key as keyof T] ?? '')}
                  </Table.Td>
                ))}
                {hasActions && (
                  <Table.Td style={{ paddingTop: py, paddingBottom: py }}>
                    <Group gap="xs">
                      {onEditClick && (
                        <ActionIcon
                          variant="subtle"
                          aria-label={`Edit row ${String(id)}`}
                          onClick={() => onEditClick(id, row)}
                        >
                          <PencilSimple size={15} />
                        </ActionIcon>
                      )}
                      {onDeleteClick && (
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          aria-label={`Delete row ${String(id)}`}
                          onClick={() => onDeleteClick([id])}
                        >
                          <Trash size={15} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Table.Td>
                )}
              </Table.Tr>
              {rowExpansion && isSelected && (
                <Table.Tr>
                  <Table.Td colSpan={columns.length + (hasActions ? 2 : 1)}>
                    {rowExpansion.render(row)}
                  </Table.Td>
                </Table.Tr>
              )}
            </React.Fragment>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
