"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Paper,
  Stack,
  Group,
  Text,
  Button,
  SimpleGrid,
  Center,
  Loader,
  ScrollArea,
  Box,
  ModuleHeader,
} from "@zetsel/ui";
import {
  DataTableWrapper,
  DataTableShellHeader,
  DataTableShellToolbar,
  DataTableShellContext,
  useTableData,
  useTableStore,
  type DataTableShellTab,
} from "@zetsel/admin";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { LayoutIcon } from "@phosphor-icons/react/dist/csr/Layout";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/csr/SquaresFour";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { TemplateCard } from "./components/TemplateCard";
import { templatesColumns } from "./templates.columns";
import { fetchTemplates, PLATFORM_LABELS, type Template } from "../../module.api";
import type { PlatformFormat } from "../../module.api";

const BASE_PATH = "/admin/automation/templates";

const MODULE_INFO = {
  name: "templates",
  label: "Templates",
  description: "Visual HTML layouts for AI-generated posts",
};

const PLATFORM_TABS = Object.entries(PLATFORM_LABELS) as [PlatformFormat, string][];

const TABS: DataTableShellTab[] = [
  { label: "All", icon: SquaresFourIcon },
  ...PLATFORM_TABS.map(([value, label]) => ({
    label,
    filter: { platform: value },
    forceFilter: (rows: Template[]) => rows.filter((t) => t.platform === value),
  })),
];

function buildBreadcrumbItems(basePath: string) {
  const parts = basePath.split("/").filter(Boolean);
  return parts.map((part, index) => ({
    label: part.charAt(0).toUpperCase() + part.slice(1),
    href: "/" + parts.slice(0, index + 1).join("/"),
  }));
}

function TemplatesListTabSync({
  activeTab,
  tabs,
}: {
  activeTab: number;
  tabs: DataTableShellTab[];
}) {
  const useTable = useTableStore();
  const reset = useTable((s) => s.reset);
  const setFilters = useTable((s) => s.setFilters);

  useEffect(() => {
    reset();
    const tabFilter = tabs[activeTab]?.filter;
    if (tabFilter && Object.keys(tabFilter).length > 0) {
      setFilters(tabFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return null;
}

function TemplatesListGrid({
  activeTabForceFilter,
  totalTemplates,
}: {
  activeTabForceFilter?: (rows: Template[]) => Template[];
  totalTemplates: number;
}) {
  const router = useRouter();
  const { rows, isLoading } = useTableData<Template>();

  const displayRows = useMemo(() => {
    if (!activeTabForceFilter) return rows;
    return activeTabForceFilter(rows);
  }, [rows, activeTabForceFilter]);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  if (displayRows.length === 0 && totalTemplates === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="sm">
          <LayoutIcon size={40} color="var(--mantine-color-dimmed)" />
          <Text fw={500} c="dimmed">
            No templates yet
          </Text>
          <Text size="sm" c="dimmed" ta="center" maw={380}>
            Templates are visual HTML layouts that define named slots. The AI agent fills those
            slots with real content when running an automation.
          </Text>
          <Button
            size="sm"
            mt="xs"
            leftSection={<PlusIcon size={14} />}
            onClick={() => router.push(`${BASE_PATH}/new`)}
          >
            Create your first template
          </Button>
        </Stack>
      </Center>
    );
  }

  if (displayRows.length === 0) {
    return (
      <Center py="xl">
        <Text size="sm" c="dimmed">
          No templates match your search or filters.
        </Text>
      </Center>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} spacing={"xs"}>
      {displayRows.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </SimpleGrid>
  );
}

interface TemplatesListInnerProps {
  activeTab: number;
  onTabChange: (index: number) => void;
  totalTemplates: number;
}

function TemplatesListInner({
  activeTab,
  onTabChange,
  totalTemplates,
}: TemplatesListInnerProps) {
  const selectedRecords = useMemo(() => [], []);

  const contextValue = useMemo(
    () => ({ activeTab, setActiveTab: onTabChange, selectedRecords }),
    [activeTab, onTabChange, selectedRecords]
  );

  const activeTabForceFilter = TABS[activeTab]?.forceFilter as
    | ((rows: Template[]) => Template[])
    | undefined;

  return (
    <DataTableShellContext.Provider value={contextValue}>
      <ModuleHeader breadcrumbItems={buildBreadcrumbItems(BASE_PATH)} />

      <Box px="md">
        <DataTableShellHeader
          moduleInfo={MODULE_INFO}
          basePath={BASE_PATH}
        />
      </Box>

      <Box px="md">
        <DataTableShellToolbar
          moduleInfo={MODULE_INFO}
          columns={templatesColumns}
          tabs={TABS}
          basePath={BASE_PATH}
        />
      </Box>

      <Box px="md" pb="md" mt="md" style={{ flex: 1, minHeight: 0 }}>
        <ScrollArea h="calc(100vh - 210px)">
          <TemplatesListGrid
            activeTabForceFilter={activeTabForceFilter}
            totalTemplates={totalTemplates}
          />
        </ScrollArea>
      </Box>
    </DataTableShellContext.Provider>
  );
}

export function TemplatesList() {
  const [activeTab, setActiveTab] = useState(0);

  const { data } = useQuery({
    queryKey: ["templates"],
    queryFn: fetchTemplates,
  });

  const totalTemplates = data?.data?.length ?? 0;

  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)" style={{ overflow: "hidden" }}>
      <Stack gap={0} h="100%">
        <DataTableWrapper<Template>
          queryKey="templates"
          queryGetFn={() => fetchTemplates()}
          dataKey="data"
          defaultPageSize={100}
          persistence={{ storageKey: MODULE_INFO.name }}
        >
          <TemplatesListTabSync activeTab={activeTab} tabs={TABS} />
          <TemplatesListInner
            activeTab={activeTab}
            onTabChange={handleTabChange}
            totalTemplates={totalTemplates}
          />
        </DataTableWrapper>
      </Stack>
    </Paper>
  );
}
