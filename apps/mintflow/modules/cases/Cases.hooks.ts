"use client";

import { useMemo } from "react";
import { useQuery } from "@peppermint/ui";

import { CASE_STYLE, FILE_STYLE, fetchCases, fetchFiles } from "./module.api";
import type { CaseIconKind } from "@/components";
import type { Person, WorkCase, WorkFile } from "./module.api";

export type SortKey = "modified" | "name" | "size";

/** Order files/cases appear in for the "Modified" sort (mock data is pre-sorted). */
const SORT_LABELS: Record<SortKey, string> = {
  modified: "Modified",
  name: "Name",
  size: "Size",
};

export function sortLabel(key: SortKey): string {
  return SORT_LABELS[key];
}

export function useCases() {
  return useQuery({ queryKey: ["cases"], queryFn: fetchCases });
}

export function useFiles() {
  return useQuery({ queryKey: ["cases", "files"], queryFn: fetchFiles });
}

function matches(name: string, query: string): boolean {
  return !query || name.toLowerCase().includes(query.toLowerCase());
}

function byName<T extends { name: string }>(a: T, b: T): number {
  return a.name.localeCompare(b.name);
}

/** "1.2 GB" / "640 KB" / "22 MB" → bytes, for size sorting. */
function toBytes(size: string): number {
  const match = size.match(/([\d.]+)\s*(KB|MB|GB)/i);
  if (!match) return 0;
  const value = Number(match[1]);
  const unit = match[2].toUpperCase();
  const factor = unit === "GB" ? 1e9 : unit === "MB" ? 1e6 : 1e3;
  return value * factor;
}

export function useFilteredCases(
  cases: WorkCase[] | undefined,
  search: string,
  sort: SortKey,
): WorkCase[] {
  return useMemo(() => {
    const rows = (cases ?? []).filter((c) => matches(c.name, search));
    if (sort === "name") return [...rows].sort(byName);
    if (sort === "size")
      return [...rows].sort((a, b) => toBytes(b.size) - toBytes(a.size));
    return rows;
  }, [cases, search, sort]);
}

export function useFilteredFiles(
  files: WorkFile[] | undefined,
  search: string,
  sort: SortKey,
): WorkFile[] {
  return useMemo(() => {
    const rows = (files ?? []).filter((f) => matches(f.name, search));
    if (sort === "name") return [...rows].sort(byName);
    if (sort === "size")
      return [...rows].sort((a, b) => toBytes(b.size) - toBytes(a.size));
    return rows;
  }, [files, search, sort]);
}

/** A normalized row for the list view — a case or a file rendered the same way. */
export interface ListRow {
  id: string;
  kind: "case" | "file";
  name: string;
  type: string;
  size: string;
  modified: string;
  people: Person[];
  iconColor: string;
  iconTint: string;
  /** Present for cases — drives the `CaseIcon` glyph. */
  caseIcon?: CaseIconKind;
  /** Present for files — the short extension label. */
  glyph?: string;
}

export function useListRows(cases: WorkCase[], files: WorkFile[]): ListRow[] {
  return useMemo(() => {
    const caseRows: ListRow[] = cases.map((c) => {
      const style = CASE_STYLE[c.category];
      return {
        id: c.id,
        kind: "case",
        name: c.name,
        type: "Case",
        size: c.size,
        modified: c.modified,
        people: c.people,
        iconColor: style.color,
        iconTint: style.tint,
        caseIcon: style.icon,
      };
    });

    const fileRows: ListRow[] = files.map((f) => {
      const style = FILE_STYLE[f.kind];
      return {
        id: f.id,
        kind: "file",
        name: f.name,
        type: style.type,
        size: f.size,
        modified: f.modified,
        people: f.people,
        iconColor: style.fg,
        iconTint: style.bg,
        glyph: f.ext,
      };
    });

    return [...caseRows, ...fileRows];
  }, [cases, files]);
}
