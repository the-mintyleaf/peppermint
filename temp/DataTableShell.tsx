"use client";

import { useCallback, useEffect, useState } from "react";

import { Box, Container, Paper } from "@mantine/core";

import { DataTableWrapper } from "@settle/core";
import { PropDataTableShell } from "./DataTableShell.type";
import { DataTableShellDataTable } from "./components/DataTable";
import { DataTableShellHeader } from "./components/Header";
import { DataTableShellTableActions } from "./components/TableActions";
import { DataTableShellToolbar } from "./components/Toolbar";
import { Context as DataTableShellContext } from "./DataTableShell.context";
import { DataTableShellSearchFilters } from "./components/SearchFilters";

export function DataTableShell({
  sustained = false,
  moduleInfo,
  tabs = [],
  idAccessor = "id",
  columns = [],
  tableActions = [],
  rowColor = "var(--mantine-color-gray-0)",
  rowBackgroundColor = "var(--mantine-color-gray-0)",
  rowStyle,
  hasServerSearch = false,
  pageSizes = [10, 20, 50, 100],
  forceFilter,
  disableActions = false,
  hideFilters,
  filterList = [],
  newButtonHref,
  onNewClick,
  onEditClick,
  onDeleteClick,
  onReviewClick,
  disableCreateButton = false,
  disableEditButton = false,
  disableDeleteButton = false,
  disableReviewButton = false,
  rowExpansion,
  customHeading,
}: PropDataTableShell) {
  // * CONTEXT
  const { filters } = DataTableWrapper.useDataTableWrapperStore();

  // * STATE

  const storageKey = `datatable_columns_${moduleInfo?.name || "default"}`;

  const [customColumns, setCustomColumns] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  // * EFFECT

  useEffect(() => {
    // Load saved column state from localStorage on mount
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedColumns = JSON.parse(saved);
        if (Array.isArray(savedColumns) && savedColumns.length > 0) {
          // Apply saved visibility to current columns
          const columnsWithSaved = columns.map((cinfo: any) => {
            // Match by accessorKey first, then by accessor
            const savedColumn = savedColumns.find((sc: any) => {
              if (cinfo.accessorKey && sc.accessorKey === cinfo.accessorKey) {
                return true;
              }
              if (cinfo.accessor && sc.accessor === cinfo.accessor) {
                return true;
              }
              return false;
            });
            return {
              ...cinfo,
              visible: savedColumn?.visible ?? true,
            };
          });
          setCustomColumns(columnsWithSaved);
          return;
        }
      }
    } catch (error) {
      console.warn("Failed to load column preferences:", error);
    }

    // Default: all columns visible
    const defaultColumns = columns.map((cinfo: any) => ({
      ...cinfo,
      visible: true,
    }));
    setCustomColumns(defaultColumns);
  }, [columns, storageKey]);

  // * FUNCTIONS

  const { resetPage } = DataTableWrapper.useDataTableWrapperStore();

  const handleTabChange = useCallback(
    (index: number) => {
      setActiveTab(index);
      // Reset to page 1 when switching tabs
      resetPage();
    },
    [resetPage],
  );

  const handleToggleColumn = useCallback((index: number) => {
    setCustomColumns((prev: any) => {
      const updated = prev.map((cinfo: any, cindex: number) =>
        cindex === index ? { ...cinfo, visible: !cinfo.visible } : cinfo,
      );
      // Save to localStorage
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (error) {
        console.warn("Failed to save column preferences:", error);
      }
      return updated;
    });
  }, [storageKey]);

  const handleResetColumns = useCallback(() => {
    setCustomColumns((prev: any) => {
      const updated = prev.map((e: any) => ({
        ...e,
        visible: true,
      }));
      // Clear localStorage when resetting
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.warn("Failed to clear column preferences:", error);
      }
      return updated;
    });
  }, [storageKey]);

  const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
  const [deleting, setDeleting] = useState(false);

  const activeTabConfig = tabs[activeTab];

  const contextValue = {
    selectedRecords,
    setSelectedRecords,
    activeTab,
    activeTabConfig,
    setActiveTab: handleTabChange,
    deleting,
    setDeleting,
  };

  return (
    <DataTableShellContext.Provider value={contextValue}>
      <Container size="xl" w="100%">
        <DataTableShellHeader
          moduleInfo={moduleInfo}
          newButtonHref={newButtonHref}
          sustained={sustained}
          onNewClick={onNewClick}
          disableCreateButton={disableCreateButton}
          customHeading={customHeading}
        />
      </Container>

      <Container size="xl">
        {/* Toolbar */}
        <DataTableShellToolbar
          moduleInfo={moduleInfo}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hideFilters={hideFilters}
          filterList={filterList}
          customColumns={customColumns}
          onToggleColumn={handleToggleColumn}
          onResetColumns={handleResetColumns}
          sustained={sustained}
          newButtonHref={newButtonHref}
          onNewClick={onNewClick}
          disableCreateButton={disableCreateButton}
        />
      </Container>

      <Container size="xl" mt="md">
        <Paper
          h={`calc(100vh - ${filters.length ? 180 : 180}px)`}
          withBorder
          style={{ borderTop: "none", overflow: "hidden" }}
        >
          <DataTableShellSearchFilters />

          <DataTableShellDataTable
            idAccessor={idAccessor}
            columns={columns}
            customColumns={customColumns}
            hasServerSearch={hasServerSearch}
            forceFilter={forceFilter}
            disableActions={disableActions}
            rowStyle={rowStyle}
            pageSizes={pageSizes}
            rowExpansion={rowExpansion}
          />
        </Paper>

        <DataTableShellTableActions
          idAccessor={idAccessor}
          sustained={sustained}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          onReviewClick={onReviewClick}
          disableEditButton={disableEditButton}
          disableDeleteButton={disableDeleteButton}
          disableReviewButton={disableReviewButton}
        />
      </Container>
    </DataTableShellContext.Provider>
  );
}
