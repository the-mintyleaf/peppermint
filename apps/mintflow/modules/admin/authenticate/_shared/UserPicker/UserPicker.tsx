"use client";

import { useState } from "react";
import { Select } from "@peppermint/ui";
import { useUserSearch } from "./UserPicker.hooks";
import type { UserPickerProps } from "./UserPicker.types";

export function UserPicker({
  label = "User",
  placeholder = "Search by username or name",
  required,
  disabled,
  value,
  onChange,
  error,
}: UserPickerProps) {
  const [search, setSearch] = useState("");
  const { data: users, isFetching } = useUserSearch(search);

  const options = (users ?? []).map((user) => ({
    value: user.id,
    label: `${user.display_name} (${user.username})`,
  }));

  return (
    <Select
      label={label}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      error={error}
      searchable
      clearable
      data={options}
      value={value}
      onChange={onChange}
      searchValue={search}
      onSearchChange={setSearch}
      rightSectionPointerEvents={isFetching ? "none" : "auto"}
      nothingFoundMessage={isFetching ? "Searching..." : "No users found"}
    />
  );
}
