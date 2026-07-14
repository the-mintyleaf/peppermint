"use client";

import { useMemo } from "react";
import { Button, Divider, Group, Text } from "@peppermint/ui";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { useTableStore } from "../../../../wrappers/DataTableWrapper";
import type { DataTableShellColumn } from "../../DataTableShell.types";
import {
  buildColumnLabelMap,
  formatFilterValue,
  getColumnKey,
} from "../DataTableShellToolbar/toolbar.utils";

interface DataTableShellActiveFiltersProps<T extends object> {
  columns: DataTableShellColumn<T>[];
}

export function DataTableShellActiveFilters<T extends object>({
  columns,
}: DataTableShellActiveFiltersProps<T>) {
  const useTable = useTableStore();
  const filters = useTable((s) => s.filters);
  const setFilters = useTable((s) => s.setFilters);
  const search = useTable((s) => s.search);
  const setSearch = useTable((s) => s.setSearch);

  const labelMap = useMemo(() => buildColumnLabelMap(columns), [columns]);
  const filterMetaByKey = useMemo(() => {
    const map: Record<string, DataTableShellColumn<T>["filter"]> = {};
    for (const col of columns) {
      if (col.filter) map[getColumnKey(col)] = col.filter;
    }
    return map;
  }, [columns]);

  const entries = Object.entries(filters);
  const hasSearch = search.trim().length > 0;
  const hasFilters = entries.length > 0 || hasSearch;

  if (!hasFilters) return null;

  const removeFilter = (key: string) => {
    const next = { ...filters };
    delete next[key];
    setFilters(next);
  };

  return (
    <>
      <Group gap={4} px="sm" py={6} wrap="wrap" style={{ flexShrink: 0 }}>
        <Text size="xs" c="dimmed" mr={4}>
          Filters:
        </Text>
        {hasSearch && (
          <Button
            variant="light"
            size="compact-xs"
            rightSection={
              <XIcon
                size={10}
                weight="bold"
                aria-label="Remove search"
                style={{ cursor: "pointer" }}
                onClick={() => setSearch("")}
              />
            }
          >
            Search: {search}
          </Button>
        )}
        {entries.map(([key, value]) => (
          <Button
            key={key}
            variant="light"
            size="compact-xs"
            rightSection={
              <XIcon
                size={10}
                weight="bold"
                aria-label={`Remove ${key} filter`}
                style={{ cursor: "pointer" }}
                onClick={() => removeFilter(key)}
              />
            }
          >
            {labelMap[key] ?? key}:{" "}
            {formatFilterValue(value, filterMetaByKey[key])}
          </Button>
        ))}
      </Group>
      <Divider style={{ flexShrink: 0 }} />
    </>
  );
}
