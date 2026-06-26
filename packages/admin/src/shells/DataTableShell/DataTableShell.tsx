"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Box, Divider, ModuleHeader, Paper } from "@peppermint/ui";
import {
  DataTableWrapper,
  useTableData,
  useTableStore,
} from "../../wrappers/DataTableWrapper";
import { DataTableShellContext } from "./DataTableShell.context";
import {
  DataTableShellActiveFilters,
  DataTableShellHeader,
  DataTableShellModuleHeaderRight,
  DataTableShellTable,
  DataTableShellTableActions,
  DataTableShellToolbar,
} from "./components";
import type {
  DataTableShellProps,
  DataTableShellInnerProps,
  DataTableShellTab,
} from "./DataTableShell.types";

// ── Tab sync — applies tab.filter to store on activeTab change ────────────────
// Lives inside DataTableWrapper so it can call useTableStore()

interface DataTableShellTabSyncProps {
  activeTab: number;
  tabs: DataTableShellTab[];
}

function DataTableShellTabSync({
  activeTab,
  tabs,
}: DataTableShellTabSyncProps) {
  const useTable = useTableStore();
  const reset = useTable((s) => s.reset);
  const setFilters = useTable((s) => s.setFilters);

  useEffect(() => {
    reset();
    const tabFilter = tabs[activeTab]?.filter;
    if (tabFilter && Object.keys(tabFilter).length > 0) {
      setFilters(tabFilter);
    }
    // reset/setFilters are stable store actions — safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return null;
}

// ── Inner component — lives inside DataTableWrapper so it can use wrapper hooks ──

function DataTableShellInner<T extends Record<string, unknown>>({
  columns,
  moduleInfo,
  idAccessor,
  basePath,
  tabs,
  newButtonHref,
  onNewClick,
  disableCreateButton,
  onEditClick,
  onDeleteClick,
  onReviewClick,
  disableEditButton,
  disableDeleteButton,
  disableReviewButton,
  pageSizes,
  forceFilter,
  rowStyle,
  rowExpansion,
  hideToolbar,
  disableActions,
  sustained,
  activeTab,
  onTabChange,
  activeTabForceFilter,
  headerRight,
  moduleAccess,
  onModuleAccessChange,
  lastEditedAt,
  shareUrl,
  hideAccessMenu,
}: DataTableShellInnerProps<T>) {
  const { rows } = useTableData<T>();
  const useTable = useTableStore();
  const selection = useTable((s) => s.selection);

  // Derive selectedRecords from rows + store selection — no duplicate state
  const selectedRecords = useMemo<T[]>(
    () => rows.filter((r) => selection.has(r[idAccessor] as string | number)),
    [rows, selection, idAccessor],
  );

  const contextValue = useMemo(
    () => ({ activeTab, setActiveTab: onTabChange, selectedRecords }),
    [activeTab, onTabChange, selectedRecords],
  );

  const breadcrumbItems = useMemo(() => {
    if (!basePath) return [];
    const parts = basePath.split("/").filter(Boolean);
    return parts.map((part, index) => ({
      label: part.charAt(0).toUpperCase() + part.slice(1),
      href: "/" + parts.slice(0, index + 1).join("/"),
    }));
  }, [basePath]);

  const rowsUpdatedAt = useMemo(() => {
    let latest: string | undefined;
    for (const row of rows) {
      const value = row.updatedAt;
      if (typeof value === "string" && (!latest || value > latest)) {
        latest = value;
      }
    }
    return latest;
  }, [rows]);

  return (
    <DataTableShellContext.Provider value={contextValue}>
      <ModuleHeader
        breadcrumbItems={breadcrumbItems}
        right={
          <DataTableShellModuleHeaderRight
            moduleInfo={moduleInfo}
            headerRight={headerRight}
            moduleAccess={moduleAccess}
            onModuleAccessChange={onModuleAccessChange}
            lastEditedAt={lastEditedAt}
            shareUrl={shareUrl}
            hideAccessMenu={hideAccessMenu}
            rowsUpdatedAt={rowsUpdatedAt}
            basePath={basePath}
          />
        }
      />

      {/* Header — title only (desktop) */}

      <Box px="md">
        <DataTableShellHeader moduleInfo={moduleInfo} />
      </Box>

      {/* Toolbar — tabs, search, column toggle (+ mobile drawer) */}
      {!hideToolbar && (
        <Box px="md">
          <DataTableShellToolbar
            moduleInfo={moduleInfo}
            columns={columns}
            tabs={tabs}
            basePath={basePath}
            newButtonHref={newButtonHref}
            onNewClick={onNewClick}
            disableCreateButton={disableCreateButton}
            sustained={sustained}
          />
        </Box>
      )}

      {/* Table paper — active filters bar + data table */}
      <Box px="md" size="xl" mt="md" pos="relative">
        <Paper
          withBorder
          style={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 210px)",
          }}
        >
          <DataTableShellActiveFilters columns={columns} />
          <Box
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <DataTableShellTable
              columns={columns}
              idAccessor={idAccessor}
              pageSizes={pageSizes}
              forceFilter={forceFilter}
              activeTabForceFilter={activeTabForceFilter}
              rowStyle={rowStyle}
              rowExpansion={rowExpansion}
              disableActions={disableActions}
            />
          </Box>
        </Paper>

        {!disableActions && (
          <DataTableShellTableActions
            idAccessor={idAccessor}
            basePath={basePath}
            sustained={sustained}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            onReviewClick={onReviewClick}
            disableEditButton={disableEditButton}
            disableDeleteButton={disableDeleteButton}
            disableReviewButton={disableReviewButton}
          />
        )}
      </Box>
    </DataTableShellContext.Provider>
  );
}

// ── Public shell component — owns activeTab and wraps DataTableWrapper ────────

export function DataTableShell<
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  // DataTableWrapper props
  queryKey,
  queryGetFn,
  dataKey,
  paginationKey,
  enableServerQuery,
  defaultPageSize,
  pageSizes = [10, 20, 50, 100],
  staleTime,
  debounceMs,
  forceFilters,
  onError,
  // Shell props
  columns,
  moduleInfo,
  idAccessor = "id",
  basePath,
  tabs = [],
  newButtonHref,
  onNewClick,
  disableCreateButton,
  onEditClick,
  onDeleteClick,
  onReviewClick,
  disableEditButton,
  disableDeleteButton,
  disableReviewButton,
  forceFilter,
  rowStyle,
  rowExpansion,
  hideToolbar = false,
  disableActions = false,
  sustained = false,
  headerRight,
  moduleAccess,
  onModuleAccessChange,
  lastEditedAt,
  shareUrl,
  hideAccessMenu,
}: DataTableShellProps<T>) {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

  const activeTabForceFilter = tabs[activeTab]?.forceFilter as
    | ((rows: T[]) => T[])
    | undefined;

  return (
    <DataTableWrapper<T>
      queryKey={queryKey}
      queryGetFn={queryGetFn}
      dataKey={dataKey}
      paginationKey={paginationKey}
      enableServerQuery={enableServerQuery}
      defaultPageSize={defaultPageSize}
      staleTime={staleTime}
      debounceMs={debounceMs}
      forceFilters={forceFilters}
      onError={onError}
      persistence={{ storageKey: moduleInfo.name }}
    >
      <DataTableShellTabSync activeTab={activeTab} tabs={tabs} />
      <DataTableShellInner<T>
        columns={columns}
        moduleInfo={moduleInfo}
        idAccessor={idAccessor}
        basePath={basePath}
        tabs={tabs}
        newButtonHref={newButtonHref}
        onNewClick={onNewClick}
        disableCreateButton={disableCreateButton}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        onReviewClick={onReviewClick}
        disableEditButton={disableEditButton}
        disableDeleteButton={disableDeleteButton}
        disableReviewButton={disableReviewButton}
        pageSizes={pageSizes}
        forceFilter={forceFilter}
        rowStyle={rowStyle}
        rowExpansion={rowExpansion}
        hideToolbar={hideToolbar}
        disableActions={disableActions}
        sustained={sustained}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        activeTabForceFilter={activeTabForceFilter}
        headerRight={headerRight}
        moduleAccess={moduleAccess}
        onModuleAccessChange={onModuleAccessChange}
        lastEditedAt={lastEditedAt}
        shareUrl={shareUrl}
        hideAccessMenu={hideAccessMenu}
      />
    </DataTableWrapper>
  );
}
