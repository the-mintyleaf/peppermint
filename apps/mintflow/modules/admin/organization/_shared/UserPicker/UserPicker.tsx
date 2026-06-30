"use client";

import {
  Combobox,
  Group,
  Loader,
  Text,
  TextInput,
  useCombobox,
  useDebouncedValue,
  useQuery,
} from "@peppermint/ui";
import { useState } from "react";
import type { UserPickerOption, UserPickerProps } from "./UserPicker.types";

export function UserPicker({
  value,
  onChange,
  fetchOptions,
  label,
  placeholder = "Search by name or email…",
  required,
  error,
  disabled,
}: UserPickerProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [selectedOption, setSelectedOption] = useState<UserPickerOption | null>(
    null,
  );

  const { data = [], isFetching } = useQuery({
    queryKey: ["user-picker-search", debouncedSearch],
    queryFn: () => fetchOptions(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
  });

  const displayValue = selectedOption?.fullName ?? (value ? "" : "");

  function handleOptionSubmit(optionValue: string) {
    const option = data.find((o) => o.id === optionValue) ?? null;
    setSelectedOption(option);
    setSearch(option?.fullName ?? "");
    onChange(optionValue, option ?? undefined);
    combobox.closeDropdown();
  }

  function handleClear() {
    setSelectedOption(null);
    setSearch("");
    onChange(null);
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    if (val === "") {
      handleClear();
    }
    combobox.openDropdown();
  }

  const options = data.map((option) => (
    <Combobox.Option value={option.id} key={option.id}>
      <Group gap="xs">
        <div>
          <Text size="sm">{option.fullName}</Text>
          <Text size="xs" c="dimmed">
            {option.email}
            {option.employeeCode ? ` · ${option.employeeCode}` : ""}
          </Text>
        </div>
      </Group>
    </Combobox.Option>
  ));

  return (
    <Combobox store={combobox} onOptionSubmit={handleOptionSubmit}>
      <Combobox.Target>
        <TextInput
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          disabled={disabled}
          value={search || displayValue}
          onChange={(e) => handleSearchChange(e.currentTarget.value)}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => setTimeout(() => combobox.closeDropdown(), 150)}
          rightSection={isFetching ? <Loader size="xs" /> : null}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options.length > 0 ? (
            options
          ) : debouncedSearch.length < 2 ? (
            <Combobox.Empty>
              Type at least 2 characters to search
            </Combobox.Empty>
          ) : isFetching ? (
            <Combobox.Empty>Searching…</Combobox.Empty>
          ) : (
            <Combobox.Empty>No users found</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
