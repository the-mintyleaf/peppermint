"use client";

import { useEffect, useState } from "react";
import {
  ActionIcon,
  Button,
  Center,
  Checkbox,
  Divider,
  Drawer,
  Group,
  Menu,
  Paper,
  Popover,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from "@zetsel/ui";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { useDebouncedValue, useDisclosure } from "@zetsel/ui";
import { useTableStore } from "../../../../wrappers/DataTableWrapper";
import { useDataTableShellContext } from "../../DataTableShell.context";
import type { DataTableShellToolbarProps } from "../../DataTableShell.types";

interface ColumnToggleListProps {
  columnToggles: { key: string; label: string; visible: boolean }[];
  toggleColumn: (key: string, visible: boolean) => void;
  handleResetColumns: () => void;
}

function ColumnToggleList({ columnToggles, toggleColumn, handleResetColumns }: ColumnToggleListProps) {
  return (
    <Stack gap={0}>
      <Text px="sm" py="xs" size="xs" c="dimmed">
        Visible columns
      </Text>
      <Divider />
      {columnToggles.map(({ key, label, visible }) => (
        <Button
          key={key}
          justify="left"
          radius={0}
          variant="subtle"
          size="xs"
          leftSection={
            <Checkbox
              checked={visible}
              readOnly
              size="xs"
              tabIndex={-1}
            />
          }
          onClick={() => toggleColumn(key, !visible)}
          style={{ color: "var(--mantine-color-text)" }}
        >
          {label}
        </Button>
      ))}
      <Divider />
      <Button
        size="xs"
        variant="subtle"
        justify="left"
        leftSection={<XIcon size={12} weight="bold" />}
        styles={{ label: { paddingLeft: 4 } }}
        onClick={handleResetColumns}
      >
        Reset to default
      </Button>
    </Stack>
  );
}

export function DataTableShellToolbar<T extends Record<string, unknown>>({
  moduleInfo,
  columns,
  tabs = [],
  basePath,
  newButtonHref,
  onNewClick,
  disableCreateButton = false,
  sustained = false,
}: DataTableShellToolbarProps<T>) {
  const { activeTab, setActiveTab } = useDataTableShellContext<T>();
  const displayLabel = moduleInfo.label ?? moduleInfo.name;
  const finalHref = newButtonHref ?? (basePath ? `${basePath}/new` : undefined);

  const useTable = useTableStore();
  const setSearch = useTable((s) => s.setSearch);
  const columnVisibility = useTable((s) => s.columnVisibility);
  const toggleColumn = useTable((s) => s.toggleColumn);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const isColumnVisible = (key: string, defaultVisible = true): boolean => {
    if (!(key in columnVisibility)) return defaultVisible;
    return columnVisibility[key] !== false;
  };

  const handleResetColumns = () => {
    columns.forEach((col) => {
      const key = col.key ?? String(col.accessor);
      toggleColumn(key, col.defaultVisible !== false);
    });
  };

  const columnToggles = columns.map((col) => {
    const key = col.key ?? String(col.accessor);
    const visible = isColumnVisible(key, col.defaultVisible !== false);
    const label = typeof col.title === "string" ? col.title : key;
    return { key, label, visible };
  });

  const activeTabLabel = tabs[activeTab]?.label ?? `All ${displayLabel}`;

  return (
    <>
      {/* ── Mobile: fixed bottom bar ─────────────────────────────────────── */}
      <Paper
        px="md"
        py="xs"
        w="100%"
        hiddenFrom="lg"
        pos="fixed"
        bottom={0}
        left="50%"
        style={{ transform: "translateX(-50%)", zIndex: 100 }}
        withBorder
      >
        <Group justify="space-between">
          <Button
            variant="subtle"
            size="xs"
            leftSection={<ArrowLeftIcon size={13} />}
          >
            Back
          </Button>

          <Group gap={4}>
            <ActionIcon
              variant="subtle"
              size="lg"
              aria-label="Open filters and options"
              onClick={openDrawer}
            >
              <FunnelIcon size={18} />
            </ActionIcon>

            {sustained && onNewClick ? (
              <ActionIcon
                size="lg"
                aria-label={`New ${displayLabel}`}
                disabled={disableCreateButton}
                onClick={onNewClick}
              >
                <PlusIcon size={18} />
              </ActionIcon>
            ) : (
              <ActionIcon
                component="a"
                size="lg"
                href={disableCreateButton ? undefined : finalHref}
                aria-label={`New ${displayLabel}`}
                disabled={disableCreateButton}
                suppressHydrationWarning
              >
                <PlusIcon size={18} />
              </ActionIcon>
            )}
          </Group>
        </Group>
      </Paper>

      {/* ── Mobile: filter drawer ─────────────────────────────────────────── */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        position="bottom"
        title="Filters & Options"
        size="auto"
      >
        <Stack gap="md" p="md">
          {tabs.length > 0 && (
            <Menu>
              <Menu.Target>
                <Button
                  variant="light"
                  size="sm"
                  fullWidth
                  rightSection={<CaretDownIcon size={13} />}
                >
                  {activeTabLabel}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {tabs.map((tab, index) => {
                  const IconComponent = tab.icon as React.ComponentType<any>;
                  return (
                    <Menu.Item
                      key={index}
                      onClick={() => {
                        setActiveTab(index);
                        closeDrawer();
                      }}
                      bg={
                        activeTab === index
                          ? "var(--mantine-color-blue-light)"
                          : undefined
                      }
                      leftSection={IconComponent && <IconComponent size={16} />}
                    >
                      {tab.label}
                    </Menu.Item>
                  );
                })}
              </Menu.Dropdown>
            </Menu>
          )}

          <TextInput
            leftSection={<MagnifyingGlassIcon size={14} />}
            size="sm"
            placeholder="Search…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.currentTarget.value)}
          />

          <ColumnToggleList columnToggles={columnToggles} toggleColumn={toggleColumn} handleResetColumns={handleResetColumns} />
        </Stack>
      </Drawer>

      {/* ── Desktop: toolbar row ──────────────────────────────────────────── */}
      <Group gap="xs" justify="space-between" visibleFrom="lg">
        {tabs.length > 0 ? (
          <SegmentedControl
            withItemsBorders={false}
            value={String(activeTab)}
            onChange={(value) => setActiveTab(Number(value))}
            data={tabs.map((tab, index) => {
              const IconComponent = tab.icon as React.ComponentType<any>;
              return {
                label: (
                  <Center style={{ gap: 8 }}>
                    {IconComponent && <IconComponent weight="duotone" color="var(--mantine-color-brand-5)" size={14} />}
                    <span>{tab.label}</span>
                  </Center>
                ),
                value: String(index),
              };
            })}
            size="sm"
            color="white"
            autoContrast
            styles={{ label: { paddingInline: 10, fontSize: "var(--mantine-font-size-xs)" } }}
          />
        ) : (
          <Text fw={700} size="xs">
            All {displayLabel}
          </Text>
        )}

        <Group gap={4}>
          <div suppressHydrationWarning>
            <TextInput
              miw={280}
              leftSection={<MagnifyingGlassIcon size={14} />}
              size="xs"
              placeholder="Search…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.currentTarget.value)}
            />
          </div>

          <Popover withArrow shadow="md" position="bottom-end">
            <Popover.Target>
              <Button
                color="dark"
                variant="default"
                size="xs"
                leftSection={<GearSixIcon size={13} />}
                rightSection={<CaretDownIcon size={13} />}
              >
                Columns
              </Button>
            </Popover.Target>
            <Popover.Dropdown p={0} w={200}>
              <ColumnToggleList columnToggles={columnToggles} toggleColumn={toggleColumn} handleResetColumns={handleResetColumns} />
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Group>
    </>
  );
}
