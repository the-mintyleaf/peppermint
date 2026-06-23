'use client';

import { Button, Checkbox, Divider, Stack, Text } from '@peppermint/ui';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';

export interface ColumnToggleItem {
  key: string;
  label: string;
  visible: boolean;
}

interface ColumnToggleListProps {
  columnToggles: ColumnToggleItem[];
  toggleColumn: (key: string, visible: boolean) => void;
  handleResetColumns: () => void;
}

export function ColumnToggleList({
  columnToggles,
  toggleColumn,
  handleResetColumns,
}: ColumnToggleListProps) {
  return (
    <Stack gap={0}>
      <Text px="sm" py="xs" size="xs" c="dimmed">
        Visible columns
      </Text>
      <Divider />
      {columnToggles.map(({ key, label, visible }) => (
        <Button
          key={key}
          justify="left"
           variant="subtle"
          size="xs"
          leftSection={
            <Checkbox checked={visible} readOnly size="xs" tabIndex={-1} />
          }
          onClick={() => toggleColumn(key, !visible)}
          style={{ color: 'var(--mantine-color-text)' }}
        >
          {label}
        </Button>
      ))}
      <Divider />
      <Button
        size="xs"
        variant="subtle"
        justify="left"
        leftSection={<XIcon size={12} weight="bold" />}
        styles={{ label: { paddingLeft: 4 } }}
        onClick={handleResetColumns}
      >
        Reset to default
      </Button>
    </Stack>
  );
}
