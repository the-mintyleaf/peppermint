"use client";

import { Text, dayjs } from "@peppermint/ui";
import type { DataTableShellColumn } from "../shells/DataTableShell";
import { StatusBadge } from "./StatusBadge";
import { accessorToTitle, getFieldValue } from "./columnValue";

/**
 * Matches `DataTableShellColumn<T extends object>`'s own constraint. Deliberately
 * not the stricter index-signature shape — row access already goes through an
 * internal `unknown` cast in `getFieldValue`, so nothing here needs one, and a
 * plain domain-row interface must be able to satisfy it.
 */
type Row = object;

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
    render: (record) => {
      const raw = getFieldValue(record, accessor);
      // A nullish/empty status must not render a `"null"`/`"undefined"` pill.
      if (raw == null || raw === "") {
        return (
          <Text size="xs" c="dimmed">
            —
          </Text>
        );
      }
      return (
        <StatusBadge
          value={String(raw) as S}
          colorMap={colorMap}
          labelMap={labelMap}
        />
      );
    },
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
      const parsed =
        value != null && value !== "" ? dayjs(value as string) : null;
      // Guard against unparseable values so a non-date never renders "Invalid Date".
      if (parsed && parsed.isValid()) {
        return <Text size="xs">{parsed.format(format)}</Text>;
      }
      return (
        <Text size="xs" c="dimmed">
          {fallback}
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
  /** Shown when the value is null/undefined — distinct from an explicit `false`. */
  nullLabel?: string;
}

/** A column that renders a boolean as Yes/No (or custom labels). */
export function booleanColumn<T extends Row>(
  accessor: string,
  options: BooleanColumnOptions & ColumnOverrides<T> = {},
): DataTableShellColumn<T> {
  const {
    trueLabel = "Yes",
    falseLabel = "No",
    nullLabel = "—",
    title,
    ...rest
  } = options;
  return {
    accessor,
    title: title ?? accessorToTitle(accessor),
    render: (record) => {
      const value = getFieldValue(record, accessor);
      // Don't misrepresent an unset (null) value as a definitive "No".
      if (value == null) {
        return (
          <Text size="xs" c="dimmed">
            {nullLabel}
          </Text>
        );
      }
      return <Text size="xs">{value ? trueLabel : falseLabel}</Text>;
    },
    ...rest,
  } as DataTableShellColumn<T>;
}
