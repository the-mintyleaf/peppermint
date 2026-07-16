"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AccessMenu,
  Box,
  Button,
  Group,
  ManageHeader,
  Menu,
  ModalPaper,
  ModuleHeader,
  ScrollArea,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  TextInput,
  notifications,
  useDebouncedValue,
} from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { SortAscendingIcon } from "@phosphor-icons/react/dist/csr/SortAscending";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/csr/SquaresFour";
import { RowsIcon } from "@phosphor-icons/react/dist/csr/Rows";

import { tokens } from "@/config/design";
import { BlockView } from "./block-view";
import { ListView } from "./list-view";
import {
  SORT_KEYS,
  STATUS_TABS,
  sortLabel,
  useCases,
  useFiles,
  useFilteredCases,
  useFilteredFiles,
} from "./Cases.hooks";
import type { SortKey, StatusFilter } from "./Cases.hooks";
import type { WorkCase } from "./module.api";

type CasesView = "block" | "list";

const VIEW_SEGMENTS = [
  {
    value: "block" satisfies CasesView,
    label: (
      <Group gap={6} wrap="nowrap" align="center">
        <SquaresFourIcon size={13} weight="duotone" />
        <span>Block</span>
      </Group>
    ),
  },
  {
    value: "list" satisfies CasesView,
    label: (
      <Group gap={6} wrap="nowrap" align="center">
        <RowsIcon size={13} weight="duotone" />
        <span>List</span>
      </Group>
    ),
  },
];

const STATUS_SEGMENTS = STATUS_TABS.map((t) => ({
  value: t.value,
  label: t.label,
}));

const BREADCRUMB = [{ label: "Cases", href: "/cases" }];
const CASES_SUBHEADING =
  "Track and act on the matters before the Ministry of Home Affairs — status, tasks, officers, and departments at a glance.";

function notConnected() {
  notifications.show({ message: "Not connected yet", color: "gray" });
}

export function ModuleCases() {
  const [view, setView] = useState<CasesView>("block");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchInput, 300);
  const router = useRouter();

  const { data: cases, isLoading: casesLoading } = useCases();
  const { data: files, isLoading: filesLoading } = useFiles();
  const isLoading = casesLoading || filesLoading;

  const filteredCases = useFilteredCases(cases, status, debouncedSearch, sort);
  const filteredFiles = useFilteredFiles(files, debouncedSearch);
  // Recent documents belong to the overview — hide them when a status is pinned.
  const visibleFiles = status === "all" ? filteredFiles : [];

  const totalVisible = filteredCases.length + visibleFiles.length;

  const openCase = useCallback(
    (c: WorkCase) => router.push(`/cases/${c.id}`),
    [router],
  );
  const clearFilters = useCallback(() => {
    setSearchInput("");
    setStatus("all");
  }, []);

  const isFiltered = debouncedSearch !== "" || status !== "all";

  const summary = useMemo(
    () => `${filteredCases.length} cases · ${visibleFiles.length} documents`,
    [filteredCases.length, visibleFiles.length],
  );

  return (
    <>
      <ModuleHeader
        breadcrumbItems={BREADCRUMB}
        right={
          <Group gap="xs" mr="sm">
            <AccessMenu data={{ accounts: [], roles: [] }} />
            <Button
              variant="light"
              color="gray"
              size="xs"
              leftSection={<UploadSimpleIcon size={16} aria-label="Upload" />}
              onClick={notConnected}
            >
              Upload
            </Button>
            <Button
              size="xs"
              leftSection={<PlusIcon size={16} aria-label="New case" />}
              onClick={notConnected}
            >
              New Case
            </Button>
          </Group>
        }
      />

      <ModalPaper withBorder>
        <Stack gap={0} h="100%" style={{ overflow: "hidden" }}>
          <Box px="md">
            <ManageHeader
              title="Cases"
              count={isLoading ? undefined : filteredCases.length}
              description={CASES_SUBHEADING}
            />
          </Box>

          {/* Status tabs + tools */}
          <Group justify="space-between" px="md" gap="xs" wrap="nowrap">
            <SegmentedControl
              withItemsBorders={false}
              value={status}
              onChange={(v) => setStatus(v as StatusFilter)}
              data={STATUS_SEGMENTS}
              size="sm"
              color="white"
              autoContrast
              styles={{
                label: {
                  paddingInline: 10,
                  fontSize: "var(--mantine-font-size-xs)",
                },
              }}
            />

            <Group gap={6} wrap="nowrap">
              <SegmentedControl
                value={view}
                onChange={(v) => setView(v as CasesView)}
                data={VIEW_SEGMENTS}
                size="xs"
                styles={{ label: { paddingInline: 10 } }}
              />

              <Menu shadow="sm" width={160} position="bottom-end">
                <Menu.Target>
                  <Button
                    variant="light"
                    color="gray"
                    size="xs"
                    leftSection={
                      <SortAscendingIcon size={13} weight="duotone" />
                    }
                    styles={{ root: { fontWeight: 500 } }}
                  >
                    Sort: {sortLabel(sort)}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Sort by</Menu.Label>
                  {SORT_KEYS.map((key) => (
                    <Menu.Item
                      key={key}
                      fw={key === sort ? 600 : 400}
                      onClick={() => setSort(key)}
                    >
                      {sortLabel(key)}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>

              <TextInput
                miw={210}
                leftSection={<MagnifyingGlassIcon size={13} />}
                size="xs"
                placeholder="Search cases…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.currentTarget.value)}
              />
            </Group>
          </Group>

          <Box px="md" pt="sm">
            <Text ff="monospace" fz="11px" c={tokens.muted} fw={600}>
              {summary}
            </Text>
          </Box>

          <ScrollArea style={{ flex: 1, minHeight: 0 }}>
            {isLoading ? (
              <Stack p="md" gap="md">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} height={180} radius="lg" />
                ))}
              </Stack>
            ) : totalVisible === 0 ? (
              <Stack align="center" justify="center" h={320} gap="xs">
                <Text c="dimmed" size="sm">
                  No cases match your filters
                </Text>
                {isFiltered && (
                  <Button
                    variant="transparent"
                    color="accent"
                    size="compact-xs"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                )}
              </Stack>
            ) : view === "block" ? (
              <BlockView
                cases={filteredCases}
                files={visibleFiles}
                onOpenCase={openCase}
                onOpenFile={notConnected}
              />
            ) : (
              <ListView
                cases={filteredCases}
                files={visibleFiles}
                onOpenCase={openCase}
                onOpenFile={notConnected}
              />
            )}
          </ScrollArea>
        </Stack>
      </ModalPaper>
    </>
  );
}
