"use client";

import { useCallback, useMemo, useState } from "react";
import {
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

import { MonoText } from "@/components";
import { tokens } from "@/config/design";
import { BlockView } from "./block-view";
import { ListView } from "./list-view";
import {
  sortLabel,
  useCases,
  useFiles,
  useFilteredCases,
  useFilteredFiles,
  useListRows,
} from "./Cases.hooks";
import type { SortKey } from "./Cases.hooks";

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

const SORT_KEYS: SortKey[] = ["modified", "name", "size"];

const BREADCRUMB = [{ label: "Cases", href: "/cases" }];
const CASES_SUBHEADING =
  "Work files for the ministry — cases group the tasks, sub-tasks, and files of a single piece of work.";
const STORAGE_USED = "15.7 GB used";

function notConnected() {
  notifications.show({ message: "Not connected yet", color: "gray" });
}

export function ModuleCases() {
  const [view, setView] = useState<CasesView>("block");
  const [sort, setSort] = useState<SortKey>("modified");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchInput, 300);

  const { data: cases, isLoading: casesLoading } = useCases();
  const { data: files, isLoading: filesLoading } = useFiles();
  const isLoading = casesLoading || filesLoading;

  const filteredCases = useFilteredCases(cases, debouncedSearch, sort);
  const filteredFiles = useFilteredFiles(files, debouncedSearch, sort);
  const rows = useListRows(filteredCases, filteredFiles);

  const totalVisible = filteredCases.length + filteredFiles.length;

  const handleOpen = useCallback(() => notConnected(), []);
  const clearSearch = useCallback(() => setSearchInput(""), []);

  const summary = useMemo(
    () => `${totalVisible} items · ${STORAGE_USED}`,
    [totalVisible],
  );

  return (
    <>
      <ModuleHeader
        breadcrumbItems={BREADCRUMB}
        right={
          <Group gap="xs" mr="sm">
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
              count={isLoading ? undefined : totalVisible}
              description={CASES_SUBHEADING}
            />
          </Box>

          {/* Toolbar: summary + view toggle + sort + search */}
          <Group justify="space-between" px="md" gap="xs" wrap="nowrap">
            <MonoText fz="12px" c={tokens.muted} fw={600}>
              {summary}
            </MonoText>

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
                miw={200}
                leftSection={<MagnifyingGlassIcon size={13} />}
                size="xs"
                placeholder="Search files…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.currentTarget.value)}
              />
            </Group>
          </Group>

          <ScrollArea style={{ flex: 1, minHeight: 0 }}>
            {isLoading ? (
              <Stack p="md" gap="sm">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} height={64} radius="md" />
                ))}
              </Stack>
            ) : totalVisible === 0 ? (
              <Stack align="center" justify="center" h={300} gap="xs">
                <Text c="dimmed" size="sm">
                  No cases or files found
                </Text>
                {debouncedSearch && (
                  <Button
                    variant="transparent"
                    color="accent"
                    size="compact-xs"
                    onClick={clearSearch}
                  >
                    Clear search
                  </Button>
                )}
              </Stack>
            ) : view === "block" ? (
              <BlockView
                cases={filteredCases}
                files={filteredFiles}
                onOpenCase={handleOpen}
                onOpenFile={handleOpen}
              />
            ) : (
              <ListView rows={rows} onOpenRow={handleOpen} />
            )}
          </ScrollArea>
        </Stack>
      </ModalPaper>
    </>
  );
}
