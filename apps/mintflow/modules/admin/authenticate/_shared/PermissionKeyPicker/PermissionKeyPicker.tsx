"use client";

import { Select } from "@peppermint/ui";
import {
  toGroupedOptions,
  usePermissionTree,
} from "./PermissionKeyPicker.hooks";
import type { PermissionKeyPickerProps } from "./PermissionKeyPicker.types";

export function PermissionKeyPicker({
  label = "Permission",
  placeholder = "Search permission keys",
  required,
  disabled,
  value,
  onChange,
  error,
  appFilter,
}: PermissionKeyPickerProps) {
  const { data: tree, isLoading } = usePermissionTree(appFilter);
  const options = toGroupedOptions(tree);

  return (
    <Select
      label={label}
      placeholder={isLoading ? "Loading permissions..." : placeholder}
      required={required}
      disabled={disabled || isLoading}
      error={error}
      searchable
      clearable
      data={options}
      value={value}
      onChange={onChange}
      nothingFoundMessage="No matching permissions"
    />
  );
}
