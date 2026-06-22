'use client';

import { useState } from 'react';
import { Button, SegmentedControl, Stack, Text } from '@peppermint/ui';
import { SlidersHorizontalIcon } from '@phosphor-icons/react/dist/csr/SlidersHorizontal';
import type { DensitySize } from '../../../../wrappers/DataTableWrapper';
import { useTableStore } from '../../../../wrappers/DataTableWrapper';
import { ToolbarIconButton } from './ToolbarIconButton';

const DENSITY_OPTIONS: { label: string; value: DensitySize }[] = [
  { label: 'Compact', value: 'xs' },
  { label: 'Default', value: 'md' },
  { label: 'Comfortable', value: 'lg' },
];

export function DataTableShellSettingsMenu() {
  const [opened, setOpened] = useState(false);

  const useTable = useTableStore();
  const density = useTable((s) => s.density);
  const setDensity = useTable((s) => s.setDensity);
  const reset = useTable((s) => s.reset);

  const handleClose = () => setOpened(false);

  return (
    <ToolbarIconButton
      label="Settings"
      icon={<SlidersHorizontalIcon size={18} />}
      opened={opened}
      onToggle={() => setOpened((v) => !v)}
      onClose={handleClose}
      width={260}
    >
      <Stack gap="md">
        <Stack gap="xs">
          <Text size="xs" fw={500}>
            Row density
          </Text>
          <SegmentedControl
            size="xs"
            fullWidth
            value={density}
            onChange={(value) => setDensity(value as DensitySize)}
            data={DENSITY_OPTIONS}
          />
        </Stack>
        <Button
          size="xs"
          variant="subtle"
          onClick={() => {
            reset();
            handleClose();
          }}
        >
          Reset table state
        </Button>
      </Stack>
    </ToolbarIconButton>
  );
}
