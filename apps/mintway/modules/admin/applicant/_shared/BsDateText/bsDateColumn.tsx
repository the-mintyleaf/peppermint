"use client";

import type { DataTableShellColumn } from "@peppermint/admin";

import type { BsDate } from "../applicant.types";
import { BsDateText } from "./BsDateText";

/**
 * A date column that also shows the record's Bikram Sambat sibling.
 *
 * `accessor` names the AD field; the `<accessor>_bs` sibling is read off the same
 * row. Typing the row as `object` and reading both keys dynamically keeps this
 * usable from every child-resource column file without one overload per entity —
 * the field names are checked against the DTOs at the call site, and the
 * component degrades to a plain date when the sibling is absent.
 */
export function bsDateColumn<T extends object>(
  accessor: keyof T & string,
  title: string,
  options?: { sortable?: boolean; script?: "en" | "np"; withTime?: boolean },
): DataTableShellColumn<T> {
  return {
    accessor,
    title,
    ...(options?.sortable ? { sortable: true } : {}),
    render: (row) => {
      const record = row as Record<string, unknown>;
      return (
        <BsDateText
          value={record[accessor] as string | null | undefined}
          bs={record[`${accessor}_bs`] as BsDate | null | undefined}
          script={options?.script}
          withTime={options?.withTime}
        />
      );
    },
  };
}
