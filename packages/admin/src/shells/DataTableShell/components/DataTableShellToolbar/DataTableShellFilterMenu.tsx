"use client";

import { useCallback, useMemo, useState } from "react";
import { Button, NumberInput, Stack, Text, TextInput } from "@peppermint/ui";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { DateInput } from "@mantine/dates";
import { useTableStore } from "../../../../wrappers/DataTableWrapper";
import type { DataTableShellColumn } from "../../DataTableShell.types";
import { ToolbarIconButton } from "./ToolbarIconButton";
import {
  getColumnKey,
  getColumnLabel,
  getFilterIcon,
  getFilterableColumns,
} from "./toolbar.utils";

interface DataTableShellFilterMenuProps<T extends object> {
  columns: DataTableShellColumn<T>[];
  /** When true, renders inline content without the icon popover wrapper. */
  inline?: boolean;
  onApplied?: () => void;
}

type FilterStep = "pick" | "value";

export function DataTableShellFilterMenu<T extends object>({
  columns,
  inline = false,
  onApplied,
}: DataTableShellFilterMenuProps<T>) {
  const [opened, setOpened] = useState(false);
  const [step, setStep] = useState<FilterStep>("pick");
  const [fieldQuery, setFieldQuery] = useState("");
  const [optionQuery, setOptionQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState<string | number | Date | null>(
    "",
  );

  const useTable = useTableStore();
  const filters = useTable((s) => s.filters);
  const setFilters = useTable((s) => s.setFilters);

  const filterableColumns = useMemo(
    () => getFilterableColumns(columns),
    [columns],
  );

  const selectedColumn = useMemo(
    () => filterableColumns.find((col) => getColumnKey(col) === selectedKey),
    [filterableColumns, selectedKey],
  );

  const normalizedFieldQuery = fieldQuery.trim().toLowerCase();
  const filteredFields = filterableColumns.filter((col) =>
    getColumnLabel(col).toLowerCase().includes(normalizedFieldQuery),
  );

  const filterType = selectedColumn?.filter?.type ?? "text";
  const selectOptions = selectedColumn?.filter?.options ?? [];
  const normalizedOptionQuery = optionQuery.trim().toLowerCase();
  const filteredOptions = selectOptions.filter((opt) =>
    opt.label.toLowerCase().includes(normalizedOptionQuery),
  );

  const resetState = useCallback(() => {
    setStep("pick");
    setFieldQuery("");
    setOptionQuery("");
    setSelectedKey(null);
    setDraftValue("");
  }, []);

  const handleClose = useCallback(() => {
    setOpened(false);
    resetState();
  }, [resetState]);

  const handleSelectField = useCallback((key: string) => {
    setSelectedKey(key);
    setStep("value");
    setOptionQuery("");
    setDraftValue("");
  }, []);

  const handleApply = useCallback(() => {
    if (!selectedKey || draftValue === "" || draftValue == null) return;
    const value =
      filterType === "date" && draftValue instanceof Date
        ? draftValue.toISOString().slice(0, 10)
        : draftValue;
    setFilters({ ...filters, [selectedKey]: value });
    handleClose();
    onApplied?.();
  }, [
    selectedKey,
    draftValue,
    filterType,
    filters,
    setFilters,
    handleClose,
    onApplied,
  ]);

  const content = (
    <Stack gap="xs">
      {step === "pick" ? (
        <>
          <TextInput
            size="xs"
            placeholder="Filter by"
            leftSection={<MagnifyingGlassIcon size={14} />}
            value={fieldQuery}
            onChange={(e) => setFieldQuery(e.currentTarget.value)}
            autoFocus
          />
          <Stack gap={0} mah={280} style={{ overflowY: "auto" }}>
            {filteredFields.map((col) => {
              const key = getColumnKey(col);
              const label = getColumnLabel(col);
              const Icon = getFilterIcon(col.filter);
              return (
                <Button
                  key={key}
                  justify="left"
                  variant="subtle"
                  size="xs"
                  leftSection={<Icon size={16} weight="duotone" />}
                  onClick={() => handleSelectField(key)}
                >
                  {label}
                </Button>
              );
            })}
            {filteredFields.length === 0 && (
              <Text size="xs" c="dimmed" ta="center" py="sm">
                {filterableColumns.length === 0
                  ? "No filterable columns"
                  : "No columns match"}
              </Text>
            )}
          </Stack>
        </>
      ) : (
        <>
          <Button
            variant="subtle"
            size="xs"
            justify="left"
            leftSection={<ArrowLeftIcon size={14} />}
            onClick={() => {
              setStep("pick");
              setSelectedKey(null);
              setDraftValue("");
            }}
          >
            {selectedColumn ? getColumnLabel(selectedColumn) : "Back"}
          </Button>

          {filterType === "select" && (
            <>
              <TextInput
                size="xs"
                placeholder="Search options"
                leftSection={<MagnifyingGlassIcon size={14} />}
                value={optionQuery}
                onChange={(e) => setOptionQuery(e.currentTarget.value)}
                autoFocus
              />
              <Stack gap={0} mah={200} style={{ overflowY: "auto" }}>
                {filteredOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    justify="left"
                    variant={draftValue === opt.value ? "light" : "subtle"}
                    size="xs"
                    onClick={() => {
                      setDraftValue(opt.value);
                      setFilters({ ...filters, [selectedKey!]: opt.value });
                      handleClose();
                      onApplied?.();
                    }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </Stack>
            </>
          )}

          {filterType === "text" && (
            <TextInput
              size="xs"
              placeholder={selectedColumn?.filter?.placeholder ?? "Enter value"}
              value={String(draftValue ?? "")}
              onChange={(e) => setDraftValue(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleApply();
              }}
              autoFocus
            />
          )}

          {filterType === "number" && (
            <NumberInput
              size="xs"
              placeholder={
                selectedColumn?.filter?.placeholder ?? "Enter number"
              }
              value={typeof draftValue === "number" ? draftValue : ""}
              onChange={(val) => setDraftValue(val)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleApply();
              }}
              autoFocus
            />
          )}

          {filterType === "date" && (
            <DateInput
              size="xs"
              placeholder={selectedColumn?.filter?.placeholder ?? "Pick date"}
              value={draftValue instanceof Date ? draftValue : null}
              onChange={(val) => setDraftValue(val)}
              autoFocus
            />
          )}

          {filterType !== "select" && (
            <Button
              size="xs"
              onClick={handleApply}
              disabled={draftValue === "" || draftValue == null}
            >
              Apply filter
            </Button>
          )}
        </>
      )}
    </Stack>
  );

  if (inline) {
    return content;
  }

  return (
    <ToolbarIconButton
      label="Filter"
      icon={<FunnelIcon size={18} />}
      opened={opened}
      onToggle={() => setOpened((v) => !v)}
      onClose={handleClose}
      disabled={filterableColumns.length === 0}
      width={280}
    >
      {content}
    </ToolbarIconButton>
  );
}
