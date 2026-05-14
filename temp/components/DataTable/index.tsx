"use client";

import { useCallback, useMemo, useState } from "react";
import { Divider, useMantineColorScheme } from "@mantine/core";

import { sortBy } from "lodash";
import { DataTable, DataTableSortStatus } from "mantine-datatable";

import { DataTableWrapper } from "@settle/core";
import { PropDataTableShellDataTable } from "../../DataTableShell.type";
import { DataTableEmptyState } from "../EmptyState";
import { useContext } from "../../DataTableShell.context";

export function DataTableShellDataTable({
  idAccessor,
  columns,
  customColumns = [],
  hasServerSearch,
  forceFilter,
  disableActions,
  rowStyle,
  pageSizes = [10, 20, 50, 100],
  rowExpansion,
}: PropDataTableShellDataTable) {
  //* CONTEXT

  const { data, isLoading: isFetching, selectOnRowClick } = DataTableWrapper.useDataTableContext();
  const {
    page,
    pageSize,
    pages: totalPages,
    totalItems,
  } = DataTableWrapper.useDataTableWrapperStore();
  const { selectedRecords, setSelectedRecords } = useContext();

  // * STATE

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
    columnAccessor: "name",
    direction: "asc",
  });

  // ---------------------------------------------------------------------------
  // DERIVED DATA
  // ---------------------------------------------------------------------------

  // Sorted records derived from `data` and `sortStatus`
  const sortedRecords = useMemo(() => {
    if (!data) return [];

    if (hasServerSearch) {
      // assume backend already returns sorted data
      return data;
    }

    const sorted = sortBy(data, sortStatus.columnAccessor);
    return sortStatus.direction === "desc" ? sorted.reverse() : sorted;
  }, [data, sortStatus, hasServerSearch]);

  // Apply optional forceFilter
  const visibleRecords = useMemo(
    () => (forceFilter ? forceFilter(sortedRecords) : sortedRecords),
    [sortedRecords, forceFilter],
  );

  // Visible columns (based on column visibility)
  const visibleColumns = useMemo(
    () => customColumns.filter((c: any) => c.visible),
    [customColumns],
  );

  // Transform columns to mantine-datatable format
  const transformedColumns = useMemo(
    () =>
      visibleColumns.map((col: any) => ({
        accessor: col.accessorKey || col.accessor,
        title: col.header || col.label, // Support both 'header' and 'label'
        width: col.size,
        render: col.render, // Custom render function if provided
        cellsStyle: col.cellsStyle, // Pass through cellsStyle property
      })),
    [visibleColumns],
  );

  // Final columns passed to DataTable
  const tableColumnConfig = useMemo(
    () => [
      {
        accessor: "#",
        title: "#",
        width: 32,
        textAlign: "center" as const,
        render: (_row: any, index: number) => <>{index + 1}</>,
      },
      ...transformedColumns,
    ],
    [transformedColumns],
  );

  const totalRecords = useMemo(
    () => (hasServerSearch ? totalItems : visibleRecords.length),
    [hasServerSearch, totalItems, visibleRecords.length],
  );

  // * FUNCTIONS
  const { setPage, setPageSize } = DataTableWrapper.useDataTableWrapperStore();

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
    },
    [setPage],
  );

  const handlePageSizeChange = useCallback(
    (nextSize: number) => {
      setPageSize(nextSize);
      setPage(1);
    },
    [setPageSize, setPage],
  );

  const handleSelectionChange = useCallback(
    (selection: any[]) => {
      setSelectedRecords(selection);
    },
    [setSelectedRecords],
  );

  const handleClearSelection = useCallback(() => {
    handleSelectionChange([]);
  }, [handleSelectionChange]);

  return (
    <>
      <Divider />
      <DataTable
        striped
        withColumnBorders
        withRowBorders
        idAccessor={idAccessor}
        columns={tableColumnConfig}
        records={visibleRecords}
        emptyState={<DataTableEmptyState />}
        fetching={isFetching}
        fz="xs"
        fw={500}
        horizontalSpacing="xs"
        verticalSpacing="xs"
        highlightOnHover
        rowStyle={rowStyle}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        totalRecords={totalRecords}
        page={page}
        onPageChange={handlePageChange}
        recordsPerPage={pageSize}
        recordsPerPageOptions={pageSizes}
        onRecordsPerPageChange={handlePageSizeChange}
        paginationSize="xs"
        selectionTrigger="cell"
        selectionColumnStyle={{
          maxWidth: 32,
        }}
        selectionCheckboxProps={{ size: "xs" }}
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={handleSelectionChange}
        rowExpansion={rowExpansion}
        onRowClick={selectOnRowClick ? ({ record }) => {
          setSelectedRecords(
            selectedRecords.some((r: any) => r[idAccessor || "id"] === record[idAccessor || "id"])
              ? selectedRecords.filter((r: any) => r[idAccessor || "id"] !== record[idAccessor || "id"])
              : [...selectedRecords, record]
          );
        } : undefined}
      />
    </>
  );
}
