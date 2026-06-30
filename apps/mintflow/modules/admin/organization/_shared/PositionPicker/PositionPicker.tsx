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
import type {
  PositionPickerOption,
  PositionPickerProps,
} from "./PositionPicker.types";

export function PositionPicker({
  value,
  onChange,
  fetchOptions,
  label,
  placeholder = "Search by title or code…",
  required,
  error,
  disabled,
}: PositionPickerProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [selectedOption, setSelectedOption] =
    useState<PositionPickerOption | null>(null);

  const { data = [], isFetching } = useQuery({
    queryKey: ["position-picker-search", debouncedSearch],
    queryFn: () => fetchOptions(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
  });

  const displayValue = selectedOption?.title ?? (value ? "" : "");

  function handleOptionSubmit(optionValue: string) {
    const option = data.find((o) => o.id === optionValue) ?? null;
    setSelectedOption(option);
    setSearch(option?.title ?? "");
    onChange(optionValue, option ?? undefined);
    combobox.closeDropdown();
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    if (val === "") {
      setSelectedOption(null);
      onChange(null);
    }
    combobox.openDropdown();
  }

  const options = data.map((option) => (
    <Combobox.Option value={option.id} key={option.id}>
      <Group gap="xs">
        <div>
          <Text size="sm">{option.title}</Text>
          <Text size="xs" c="dimmed">
            {option.code}
            {option.unitName ? ` · ${option.unitName}` : ""}
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
            <Combobox.Empty>No positions found</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
