'use client';

import { Button, Menu } from '@mantine/core';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { ACCESS_LEVEL_OPTIONS } from './accessMenu.utils';
import type { AccessLevel } from './AccessMenu.types';

interface AccessLevelMenuProps {
  value: AccessLevel;
  onChange: (level: AccessLevel) => void;
}

export function AccessLevelMenu({ value, onChange }: AccessLevelMenuProps) {
  const selected =
    ACCESS_LEVEL_OPTIONS.find((option) => option.value === value) ??
    ACCESS_LEVEL_OPTIONS[0];

  return (
    <Menu
      shadow="md"
      position="bottom-end"
      width={150}
      withinPortal={false}
      trapFocus={false}
    >
      <Menu.Target>
        <Button
          variant="subtle"
          size="xs"
          color="gray"
          rightSection={<CaretDownIcon size={12} />}
          aria-label={`Access level: ${selected.label}`}
        >
          {selected.shortLabel}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {ACCESS_LEVEL_OPTIONS.map((option) => (
          <Menu.Item
            key={option.value}
            onClick={() => onChange(option.value)}
            fw={option.value === value ? 600 : 400}
            style={{ fontSize: 12 }}
          >
            {option.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
