"use client";

import { useCallback, useMemo, useRef } from "react";
import { Box } from "@peppermint/ui";
import { DataTable } from "mantine-datatable";
import type { DataTableSortStatus } from "mantine-datatable";
import {
  useTableData,
  useTableStore,
} from "../../../../wrappers/DataTableWrapper";
import { useDataTableShellContext } from "../../DataTableShell.context";
import { DataTableShellEmptyState } from "../DataTableShellEmptyState";
import type { DataTableShellTableProps } from "../../DataTableShell.types";
import type { DensitySize } from '../../../../wrappers/DataTableWrapper';
import { useElementHeight } from '../../hooks/useElementHeight';

const DENSITY_SPACING: Record<
  DensitySize,
  { verticalSpacing: number; horizontalSpacing: number; fz: string }
> = {
  xs: { verticalSpacing: 4, horizontalSpacing: 6, fz: 'xs' },
  sm: { verticalSpacing: 6, horizontalSpacing: 8, fz: 'xs' },
  md: { verticalSpacing: 6, horizontalSpacing: 8, fz: 'xs' },
  lg: { verticalSpacing: 10, horizontalSpacing: 12, fz: 'sm' },
  xl: { verticalSpacing: 12, horizontalSpacing: 14, fz: 'sm' },
};

export function DataTableShellTable<T extends Record<string, unknown>>({
  columns,
  idAccessor,
  pageSizes,
  forceFilter,
  activeTabForceFilter,
  rowStyle,
  rowExpansion,
  disableActions = false,
}: DataTableShellTableProps<T>) {
  const { rows, isLoading, isFetching, isDebouncing, paginationMeta } = useTableData<T>();
  const { selectedRecords } = useDataTableShellContext<T>();

  const useTable = useTableStore();
  const page = useTable((s) => s.page);
  const pageSize = useTable((s) => s.pageSize);
  const setPage = useTable((s) => s.setPage);
  const setPageSize = useTable((s) => s.setPageSize);
  const sort = useTable((s) => s.sort);
  const setSort = useTable((s) => s.setSort);
  const columnVisibility = useTable((s) => s.columnVisibility);
  const density = useTable((s) => s.density);
  const setSelection = useTable((s) => s.setSelection);

  const spacing = DENSITY_SPACING[density];
  const tableRef = useRef<HTMLDivElement>(null);
  const tableHeight = useElementHeight(tableRef);

  // Apply tab-level then shell-level client-side post-filters
  const filteredRows = useMemo<T[]>(() => {
    let result = rows;
    if (activeTabForceFilter) result = activeTabForceFilter(result);
    if (forceFilter) result = forceFilter(result);
    return result;
  }, [rows, activeTabForceFilter, forceFilter]);

  // Compute effective columns respecting columnVisibility store
  const effectiveColumns = useMemo(() => {
    const visible = columns.filter((col) => {
      const key = col.key ?? String(col.accessor);
      if (!(key in columnVisibility)) return col.defaultVisible !== false;
      return columnVisibility[key] !== false;
    });

    return [
      {
        accessor: "#" as keyof T & string,
        title: "#",
        width: 44,
        textAlign: "center" as const,
        render: (_row: T, index: number) => (page - 1) * pageSize + index + 1,
      },
      ...visible,
    ];
  }, [columns, columnVisibility, page, pageSize]);

  // mantine-datatable requires sortStatus to be defined when onSortStatusChange is set.
  // Default to the first column accessor so the prop is always a valid value.
  const defaultSortAccessor = (columns[0]?.accessor ?? "id") as keyof T &
    string;

  const sortStatus: DataTableSortStatus<T> = sort[0]
    ? {
        columnAccessor: sort[0].field as keyof T & string,
        direction: sort[0].direction,
      }
    : { columnAccessor: defaultSortAccessor, direction: "asc" };

  const handleSortStatusChange = useCallback(
    (status: DataTableSortStatus<T>) => {
      setSort([
        { field: String(status.columnAccessor), direction: status.direction },
      ]);
    },
    [setSort],
  );

  const handlePageChange = useCallback((p: number) => setPage(p), [setPage]);

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      setPage(1);
    },
    [setPageSize, setPage],
  );

  // Bridge mantine-datatable's record array selection to the store's Set<id>
  const handleSelectionChange = useCallback(
    (records: T[]) => {
      const ids = records.map((r) => r[idAccessor] as string | number);
      setSelection(new Set(ids));
    },
    [setSelection, idAccessor],
  );

  return (
    <Box
      ref={tableRef}
      style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
    >
      <DataTable<T>
      striped
      withColumnBorders
      withRowBorders
      highlightOnHover
      fz={spacing.fz}
      fw={500}
      horizontalSpacing={spacing.horizontalSpacing}
      verticalSpacing={spacing.verticalSpacing}
      idAccessor={idAccessor as keyof T & string}
      columns={effectiveColumns}
      records={filteredRows}
      fetching={isLoading || isFetching || isDebouncing}
      height={tableHeight > 0 ? tableHeight : undefined}
      emptyState={<DataTableShellEmptyState />}
      rowStyle={rowStyle}
      sortStatus={sortStatus}
      onSortStatusChange={handleSortStatusChange}
      totalRecords={paginationMeta.total}
      page={page}
      onPageChange={handlePageChange}
      recordsPerPage={pageSize}
      recordsPerPageOptions={pageSizes}
      onRecordsPerPageChange={handlePageSizeChange}
      paginationSize="xs"
      selectedRecords={disableActions ? undefined : selectedRecords}
      onSelectedRecordsChange={
        disableActions ? undefined : handleSelectionChange
      }
      selectionTrigger="cell"
      selectionColumnStyle={{ maxWidth: 32 }}
      selectionCheckboxProps={{ size: "xs" }}
      rowExpansion={rowExpansion}
    />
    </Box>
  );
}
