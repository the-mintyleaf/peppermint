"use client";

import { Button, Loader, Menu, Text } from "@peppermint/ui";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";

import type { UnitPickerMenuProps } from "./UnitPickerMenu.types";

export function UnitPickerMenu({
  options,
  value,
  onChange,
  loading = false,
  disabled = false,
}: UnitPickerMenuProps) {
  const selected = options.find((option) => option.value === value) ?? null;
  const targetLabel =
    selected?.label ?? (loading ? "Loading units…" : "Select unit");

  return (
    <Menu shadow="md" position="bottom-end" width={260} withArrow>
      <Menu.Target>
        <Button
          variant="default"
          disabled={disabled || (loading && options.length === 0)}
          leftSection={loading ? <Loader size={14} /> : undefined}
          rightSection={<CaretDownIcon size={14} aria-hidden />}
          aria-label={`Unit: ${selected?.label ?? "none selected"}`}
        >
          {targetLabel}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Unit</Menu.Label>
        {options.length === 0 ? (
          <Menu.Item disabled>
            <Text size="sm" c="dimmed">
              No units available
            </Text>
          </Menu.Item>
        ) : (
          options.map((option) => (
            <Menu.Item
              key={option.value}
              onClick={() => onChange(option.value)}
              fw={option.value === value ? 600 : 400}
              pl={12 + option.depth * 12}
            >
              {option.label}
            </Menu.Item>
          ))
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
