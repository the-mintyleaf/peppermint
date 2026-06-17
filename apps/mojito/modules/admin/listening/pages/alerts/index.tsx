"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Paper,
  Stack,
  Button,
  Box,
  ModuleHeader,
} from "@peppermint/ui";
import {
  DataTableWrapper,
  DataTableShellToolbar,
  DataTableShellTable,
  DataTableShellContext,
  useTableStore,
  type DataTableShellTab,
} from "@peppermint/admin";
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAlertsPaginated, markAllAlertsReadApi } from "../../alerts.api";
import { alertsColumns } from "./alerts.columns";
import { alertQueryKeys } from "../../alerts.queryKeys";
import type { AlertRow } from "../../alerts.types";
import { buildBreadcrumbItems } from "@/modules/admin/shared/pageShell.utils";
import { ModulePageHeader } from "@/modules/admin/shared/ModulePageHeader";

const BASE_PATH = "/admin/listening/alerts";

const MODULE_INFO = {
  name: "alerts",
  label: "Alerts",
  description: "Real-time alerts for volume spikes, crises, and keyword mentions",
};

const TABS: DataTableShellTab[] = [
  { label: "All", icon: BellIcon },
  { label: "Unread", icon: BellIcon, filter: { read: "unread" } },
  { label: "Read", icon: CheckIcon, filter: { read: "read" } },
];

function AlertsTabSync({ activeTab }: { activeTab: number }) {
  const useTable = useTableStore();
  const reset = useTable((s) => s.reset);
  const setFilters = useTable((s) => s.setFilters);

  useEffect(() => {
    reset();
    const tabFilter = TABS[activeTab]?.filter;
    if (tabFilter && Object.keys(tabFilter).length > 0) {
      setFilters(tabFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return null;
}

function AlertsInner({
  activeTab,
  onTabChange,
  onMarkAllRead,
  markAllLoading,
}: {
  activeTab: number;
  onTabChange: (index: number) => void;
  onMarkAllRead: () => void;
  markAllLoading: boolean;
}) {
  const selectedRecords = useMemo(() => [], []);
  const contextValue = useMemo(
    () => ({ activeTab, setActiveTab: onTabChange, selectedRecords }),
    [activeTab, onTabChange, selectedRecords],
  );

  return (
    <DataTableShellContext.Provider value={contextValue}>
      <ModuleHeader breadcrumbItems={buildBreadcrumbItems(BASE_PATH)} />

      <Box px="md">
        <ModulePageHeader
          moduleInfo={MODULE_INFO}
          basePath={BASE_PATH}
          disableCreateButton
          actions={
            <Button
              size="xs"
              variant="light"
              leftSection={<CheckIcon size={12} />}
              loading={markAllLoading}
              onClick={onMarkAllRead}
            >
              Mark all read
            </Button>
          }
        />
      </Box>

      <Box px="md">
        <DataTableShellToolbar
          moduleInfo={MODULE_INFO}
          columns={alertsColumns}
          tabs={TABS}
          basePath={BASE_PATH}
          disableCreateButton
        />
      </Box>

      <Box px="md" pb="md" style={{ flex: 1, minHeight: 0 }}>
        <DataTableShellTable<AlertRow>
          columns={alertsColumns}
          idAccessor="id"
          pageSizes={[10, 20, 50]}
          disableActions
        />
      </Box>
    </DataTableShellContext.Provider>
  );
}

export function AlertsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const qc = useQueryClient();
  const markAll = useMutation({
    mutationFn: markAllAlertsReadApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: [alertQueryKeys.list()] }),
  });

  const handleMarkAllRead = useCallback(() => {
    markAll.mutate();
  }, [markAll]);

  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)" style={{ overflow: "hidden" }}>
      <Stack gap={0} h="100%">
        <DataTableWrapper<AlertRow>
          queryKey={alertQueryKeys.list()}
          queryGetFn={fetchAlertsPaginated}
          dataKey="data"
          paginationKey="meta"
          defaultPageSize={20}
          persistence={{ storageKey: MODULE_INFO.name }}
        >
          <AlertsTabSync activeTab={activeTab} />
          <AlertsInner
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onMarkAllRead={handleMarkAllRead}
            markAllLoading={markAll.isPending}
          />
        </DataTableWrapper>
      </Stack>
    </Paper>
  );
}
