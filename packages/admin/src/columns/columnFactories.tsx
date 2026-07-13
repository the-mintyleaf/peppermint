"use client";

import { Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "../shells/DataTableShell";
import { StatusBadge } from "./StatusBadge";
import { accessorToTitle, getFieldValue } from "./columnValue";

type Row = Record<string, unknown>;

/** Column-factory options minus the parts each factory computes itself. */
type ColumnOverrides<T extends Row> = Omit<
  Partial<DataTableShellColumn<T>>,
  "accessor" | "render"
>;

// ── statusColumn ──────────────────────────────────────────────────────────────

export interface StatusColumnOptions<S extends string> {
  colorMap: Partial<Record<S, string>>;
  labelMap?: Partial<Record<S, string>>;
}

/** A column that renders its value as a StatusBadge. Replaces the copy-pasted maps. */
export function statusColumn<T extends Row, S extends string = string>(
  accessor: string,
  options: StatusColumnOptions<S> & ColumnOverrides<T>,
): DataTableShellColumn<T> {
  const { colorMap, labelMap, title, ...rest } = options;
  return {
    accessor,
    title: title ?? accessorToTitle(accessor),
    render: (record) => (
      <StatusBadge
        value={String(getFieldValue(record, accessor)) as S}
        colorMap={colorMap}
        labelMap={labelMap}
      />
    ),
    ...rest,
  } as DataTableShellColumn<T>;
}

// ── dateColumn ────────────────────────────────────────────────────────────────

export interface DateColumnOptions {
  /** dayjs format. Defaults to "MMM D, YYYY". */
  format?: string;
  /** Rendered when the value is empty. Defaults to "—". */
  fallback?: string;
}

/** A column that formats a date value consistently (was 3 incompatible formatters). */
export function dateColumn<T extends Row>(
  accessor: string,
  options: DateColumnOptions & ColumnOverrides<T> = {},
): DataTableShellColumn<T> {
  const { format = "MMM D, YYYY", fallback = "—", title, ...rest } = options;
  return {
    accessor,
    title: title ?? accessorToTitle(accessor),
    render: (record) => {
      const value = getFieldValue(record, accessor);
      return (
        <Text size="xs" c={value ? undefined : "dimmed"}>
          {value ? dayjs(value as string).format(format) : fallback}
        </Text>
      );
    },
    ...rest,
  } as DataTableShellColumn<T>;
}

// ── booleanColumn ─────────────────────────────────────────────────────────────

export interface BooleanColumnOptions {
  trueLabel?: string;
  falseLabel?: string;
}

/** A column that renders a boolean as Yes/No (or custom labels). */
export function booleanColumn<T extends Row>(
  accessor: string,
  options: BooleanColumnOptions & ColumnOverrides<T> = {},
): DataTableShellColumn<T> {
  const { trueLabel = "Yes", falseLabel = "No", title, ...rest } = options;
  return {
    accessor,
    title: title ?? accessorToTitle(accessor),
    render: (record) => (
      <Text size="xs">
        {getFieldValue(record, accessor) ? trueLabel : falseLabel}
      </Text>
    ),
    ...rest,
  } as DataTableShellColumn<T>;
}
